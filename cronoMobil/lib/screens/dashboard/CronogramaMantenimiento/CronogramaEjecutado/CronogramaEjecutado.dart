import 'dart:async'; // Necesario para usar Timer
import 'dart:convert';
import 'dart:io';
import 'package:cmsmobile/screens/services/CronogramaService.dart';
import 'package:cmsmobile/screens/services/SessionManager.dart';
import 'package:cmsmobile/screens/services/MasterTableService.dart';
import 'package:cmsmobile/screens/services/ResumenMantenimientoService.dart';
import 'package:cmsmobile/screens/services/FileMediaService.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:image_picker/image_picker.dart';
import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:cmsmobile/screens/services/LocationService.dart';

class CronogramaEjecutado extends StatefulWidget {
  final CronogramaItem item;
  const CronogramaEjecutado({super.key, required this.item});

  @override
  State<CronogramaEjecutado> createState() => _CronogramaEjecutadoState();
}

class _CronogramaEjecutadoState extends State<CronogramaEjecutado> {
  // Estado para las imágenes por categoría
  final List<File> _imagesAntes = [];
  final List<File> _imagesDespues = [];
  final List<File> _imagesRepuestos = [];

  final ImagePicker _picker = ImagePicker();
  bool _isUploadingAll = false;
  String _uploadStatusText = "";

  // Estado para las entradas de texto
  // RENAMED: Evaluación del Problema -> Solución implementada
  final TextEditingController _solucionImplementadaController =
      TextEditingController();
  // RENAMED: Solución del Problema -> Observación
  final TextEditingController _observacionController = TextEditingController();

  // NEW: Inputs adicionales
  final TextEditingController _contadorFinalController =
      TextEditingController();
  final TextEditingController _valorController = TextEditingController();

  static const int _maxLength = 300;

  // Estado para Dropdowns
  List<MasterTableItem> _listMotivoVisita = [];
  String? _selectedMotivoVisita;
  bool _isLoadingMotivo = false;

  List<MasterTableItem> _listEstadoEquipo = [];
  String? _selectedEstadoEquipo;
  bool _isLoadingEstado = false;

  // Estado del temporizador
  late Timer _timer;
  Duration _totalDuration =
      Duration.zero; // Duración total esperada de la tarea
  Duration _timeRemaining =
      Duration.zero; // Tiempo restante (contador decreciente)
  double _timeConsumedPercentage = 0.0; // Porcentaje de tiempo consumido

  bool _requiresSpareParts = false;
  final LocationService _locationService = LocationService();

  @override
  void initState() {
    super.initState();
    _calculateTotalDuration(); // 1. Calcular la duración total al iniciar
    _startTimer(); // 2. Iniciar el contador
    _loadMasterData(); // 3. Cargar datos de los dropdowns

    // Escuchadores para actualizar el contador de caracteres
    _solucionImplementadaController.addListener(() => setState(() {}));
    _observacionController.addListener(() => setState(() {}));

    // Iniciar seguimiento de ubicación
    _loadInitialTracking();
  }

  Future<void> _loadInitialTracking() async {
    final userData = await SessionManager.getUserData();
    final String coduser = userData['coduser'] ?? '0';
    final int tecnicoId = int.tryParse(coduser) ?? 0;
    
    _locationService.startTracking(
      ticketId: widget.item.idmantenimiento, 
      tecnicoId: tecnicoId
    );
  }

  Future<void> _loadMasterData() async {
    setState(() {
      _isLoadingMotivo = true;
      _isLoadingEstado = true;
    });

    try {
      final motivos = await MasterTableService.obtenerDatosMasterTable('RM');
      final estados = await MasterTableService.obtenerDatosMasterTable('EF');

      if (mounted) {
        setState(() {
          _listMotivoVisita = motivos;
          _listEstadoEquipo = estados;
          _isLoadingMotivo = false;
          _isLoadingEstado = false;
        });
      }
    } catch (e) {
      print('Error cargando master tables: $e');
      if (mounted) {
        setState(() {
          _isLoadingMotivo = false;
          _isLoadingEstado = false;
        });
      }
    }
  }

  @override
  void dispose() {
    _timer.cancel(); // Detener el temporizador
    _solucionImplementadaController.dispose();
    _observacionController.dispose();
    _contadorFinalController.dispose();
    _valorController.dispose();
    // Se ha eliminado stopTracking de aquí para permitir que el rastreo
    // siga activo si el usuario navega al monitor de GPS.
    super.dispose();
  }

  void _calculateTotalDuration() {
    try {
      // Formato para la fecha y hora combinada
      final dateFormat = DateFormat('yyyy-MM-dd HH:mm:ss');

      // Obtener la fecha de HOY (ya que fecreaRealIni y fecreaRealFin son de hoy)
      final String today = DateFormat('yyyy-MM-dd').format(DateTime.now());

      // Combinar fecha de HOY con la hora inicial (08:00:00)
      final String startDateTimeString =
          '$today ${widget.item.horaInicialReal}';
      final DateTime startTime = dateFormat.parse(startDateTimeString);

      // Combinar fecha de HOY con la hora final (17:00:00)
      final String endDateTimeString = '$today ${widget.item.horaFinalReal}';
      final DateTime endTime = dateFormat.parse(endDateTimeString);

      // La duración total es la diferencia entre la hora final y la hora inicial
      _totalDuration = endTime.difference(startTime);

      // *** CORRECCIÓN PRINCIPAL: Calcular tiempo transcurrido desde inicio hasta AHORA ***
      final DateTime now = DateTime.now();
      final Duration elapsedTime = now.difference(startTime);

      // El tiempo restante es la duración total menos el tiempo ya transcurrido
      _timeRemaining = _totalDuration - elapsedTime;

      // Asegurar que el tiempo restante no sea negativo
      if (_timeRemaining.isNegative) {
        _timeRemaining = Duration.zero;
      }
    } catch (e) {
      // Manejo de errores si el formato de fecha/hora es incorrecto
      print("Error al parsear fechas/horas para el temporizador: $e");
      _totalDuration = const Duration(hours: 9); // 8:00 a 17:00 = 9 horas
      _timeRemaining = _totalDuration;
    }
  }

  void _startTimer() {
    // Iniciar un temporizador que se ejecuta cada segundo
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (mounted) {
        setState(() {
          // Decrementar el tiempo restante
          if (_timeRemaining.inSeconds > 0) {
            _timeRemaining = _timeRemaining - const Duration(seconds: 1);
          } else {
            // El tiempo ha terminado (Timeout)
            _timeRemaining = Duration.zero;
            timer.cancel();

            // 3. ACTUALIZACIÓN AUTOMÁTICA: Si el técnico no finaliza a tiempo, se marca como estado 5.
            _handleStatusUpdate(5);
          }

          // Calcular el porcentaje de tiempo CONSUMIDO
          if (_totalDuration.inSeconds > 0) {
            final int elapsedSeconds =
                _totalDuration.inSeconds - _timeRemaining.inSeconds;
            _timeConsumedPercentage = elapsedSeconds / _totalDuration.inSeconds;
          } else {
            _timeConsumedPercentage = 0.0;
          }
        });
      }
    });
  }

  // Método helper para manejar la actualización de estado
  Future<void> _handleStatusUpdate(int state) async {
    try {
      final userData = await SessionManager.getUserData();
      final String coduser = userData['coduser'] ?? '';

      if (coduser.isNotEmpty) {
        await CronogramaService.actualizarEstado(
          idMantenimiento: widget.item.idmantenimiento,
          nuevoEstado: state,
          usuario: coduser,
        );
      }
    } catch (e) {
      print('Error al actualizar estado en CronogramaEjecutado: $e');
    }
  }

  // --- FUNCIÓN PARA DETERMINAR EL COLOR SEGÚN EL PORCENTAJE ---
  Color _getTimerColor(double percentageConsumed) {
    if (percentageConsumed < 0.25) {
      // 0% - 25% consumido: Color Verde (Mucho tiempo restante)
      return Colors.green[700]!;
    } else if (percentageConsumed < 0.75) {
      // 25% - 75% consumido: Color Azul (Tiempo estándar)
      return Colors.blue[700]!;
    } else if (percentageConsumed < 1.0) {
      // 75% - 100% consumido: Color Naranja (Poco tiempo restante)
      return Colors.orange[700]!;
    } else {
      // 100% consumido o más: Color Rojo (Tiempo excedido o terminado)
      return Colors.red[700]!;
    }
  }

  // --- LÓGICA DE IMÁGENES ---

  Future<void> _pickAndCompressImage(String category) async {
    List<File> targetList;
    switch (category) {
      case 'Antes':
        targetList = _imagesAntes;
        break;
      case 'Después':
        targetList = _imagesDespues;
        break;
      case 'Repuestos':
        targetList = _imagesRepuestos;
        break;
      default:
        return;
    }

    if (targetList.length >= 4) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Límite de 4 fotos alcanzado por categoría.'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    // Mostrar diálogo para elegir origen
    final ImageSource? source = await showDialog<ImageSource>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Seleccionar Imagen'),
        content: const Text('¿Desde dónde deseas obtener la imagen?'),
        actions: [
          TextButton.icon(
            onPressed: () => Navigator.pop(context, ImageSource.gallery),
            icon: const Icon(Icons.photo_library),
            label: const Text('Galería'),
          ),
          TextButton.icon(
            onPressed: () => Navigator.pop(context, ImageSource.camera),
            icon: const Icon(Icons.camera_alt),
            label: const Text('Cámara'),
          ),
        ],
      ),
    );

    if (source == null) return;

    try {
      // Intentar solicitar permisos pero no bloquear si falla el plugin
      try {
        if (source == ImageSource.camera) {
          await Permission.camera.request();
        } else {
          await Permission.photos.request();
        }
      } catch (e) {
        debugPrint('Error solicitando permisos: $e');
      }

      final XFile? pickedFile = await _picker.pickImage(
        source: source,
        imageQuality: 100,
      );

      if (pickedFile == null) return;

      // Validar formato imagen
      final String ext = p.extension(pickedFile.path).toLowerCase();
      if (ext != '.jpg' && ext != '.jpeg' && ext != '.png') {
        _showAlertDialog(
          'Formato No Soportado',
          'Por favor selecciona una imagen JPG o PNG.',
          false,
        );
        return;
      }

      // Comprimir a < 100KB
      final Directory tempDir = await getTemporaryDirectory();
      final String targetPath = p.join(
        tempDir.path,
        "temp_${DateTime.now().millisecondsSinceEpoch}$ext",
      );

      int quality = 85;
      XFile? result = await FlutterImageCompress.compressAndGetFile(
        pickedFile.path,
        targetPath,
        quality: quality,
      );

      // Si aún pesa mucho, bajar calidad agresivamente (loop simple)
      while (result != null &&
          await File(result.path).length() > 100 * 1024 &&
          quality > 10) {
        quality -= 15;
        result = await FlutterImageCompress.compressAndGetFile(
          pickedFile.path,
          targetPath,
          quality: quality,
        );
      }

      if (result != null) {
        setState(() {
          targetList.add(File(result!.path));
        });
      }
    } catch (e) {
      print('Error al procesar imagen: $e');
    }
  }

  String _standardizeFileName(
    String originalName,
    int idTicket,
    int index,
    String category,
  ) {
    //MC-000004435-20251212130832.jpg parecido a su screenshot
    print(
      'DEBUG: _standardizeFileName - Original: $originalName, ID: $idTicket, Category: $category',
    );
    final String timestamp = DateFormat(
      'yyyyMMddHHmmss',
    ).format(DateTime.now());
    String baseName = "IMG_${idTicket}_${category}_$index";

    // Remplazar espacios por guion bajo
    baseName = baseName.replaceAll(' ', '_');

    // Limite 20 caracteres maximo (sin contar extension)
    if (baseName.length > 20) {
      baseName = baseName.substring(0, 20);
    }

    final String extension = p.extension(originalName).toLowerCase();
    final String finalName = "$baseName$extension";
    print('DEBUG: _standardizeFileName - Final Name: $finalName');
    return finalName;
  }

  Widget _buildImageCounter(List<File> list) {
    if (list.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.only(top: 8.0),
      child: Wrap(
        spacing: 8,
        children: list.asMap().entries.map((entry) {
          int idx = entry.key;
          File file = entry.value;
          return Stack(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: Image.file(
                  file,
                  width: 60,
                  height: 60,
                  fit: BoxFit.cover,
                ),
              ),
              Positioned(
                right: -10,
                top: -10,
                child: IconButton(
                  icon: const Icon(Icons.cancel, color: Colors.red, size: 20),
                  onPressed: () => setState(() => list.removeAt(idx)),
                ),
              ),
            ],
          );
        }).toList(),
      ),
    );
  }

  void _showAlertDialog(String title, String message, bool isSuccess) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  // --- WIDGETS AUXILIARES ---
  Color _getStatusColor(int estado) {
    switch (estado) {
      case 0:
        return Colors.orange[700]!;
      case 1:
        return Colors.green[700]!;
      case -1:
        return Colors.red[700]!;
      default:
        return Colors.grey[500]!;
    }
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0, top: 4.0),
      child: Text(
        title,
        style: const TextStyle(
          fontWeight: FontWeight.bold,
          fontSize: 16,
          color: Color(0xFF00796B),
        ),
      ),
    );
  }

  Widget _buildTextFieldWithCounter(
    String title,
    TextEditingController controller,
    String labelText,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _buildSectionTitle(title),
        Card(
          elevation: 4,
          child: Padding(
            padding: const EdgeInsets.all(12.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                TextFormField(
                  controller: controller,
                  maxLength: _maxLength,
                  decoration: InputDecoration(
                    labelText: labelText,
                    border: const OutlineInputBorder(),
                    alignLabelWithHint: true,
                    counterText: "",
                  ),
                  maxLines: 5,
                  keyboardType: TextInputType.multiline,
                ),
                const SizedBox(height: 4),
                Align(
                  alignment: Alignment.centerRight,
                  child: Text(
                    '${controller.text.length}/$_maxLength',
                    style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDropdown(
    String title,
    List<MasterTableItem> items,
    String? selectedValue,
    bool isLoading,
    ValueChanged<String?> onChanged,
    String hint,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _buildSectionTitle(title),
        Card(
          elevation: 4,
          child: Padding(
            padding: const EdgeInsets.all(12.0),
            child: isLoading
                ? const Center(child: CircularProgressIndicator())
                : DropdownButtonFormField<String>(
                    value: selectedValue,
                    decoration: const InputDecoration(
                      border: OutlineInputBorder(),
                      contentPadding: EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 5,
                      ),
                    ),
                    hint: Text(hint),
                    isExpanded: true,
                    items: items.map((MasterTableItem item) {
                      return DropdownMenuItem<String>(
                        value: item.codigo,
                        child: Text(item.nombre.toUpperCase()),
                      );
                    }).toList(),
                    onChanged: onChanged,
                  ),
          ),
        ),
      ],
    );
  }

  Widget _buildSimpleTextField(
    String title,
    TextEditingController controller,
    String label, {
    TextInputType keyboardType = TextInputType.text,
    IconData? icon,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _buildSectionTitle(title),
        Card(
          elevation: 4,
          child: Padding(
            padding: const EdgeInsets.all(12.0),
            child: TextFormField(
              controller: controller,
              keyboardType: keyboardType,
              decoration: InputDecoration(
                labelText: label,
                prefixIcon: icon != null ? Icon(icon) : null,
                border: const OutlineInputBorder(),
              ),
            ),
          ),
        ),
      ],
    );
  }

  // Formatea la duración restante a HH:MM:SS
  String _formatDuration(Duration duration) {
    String twoDigits(int n) => n.toString().padLeft(2, "0");
    String twoDigitMinutes = twoDigits(duration.inMinutes.remainder(60));
    String twoDigitSeconds = twoDigits(duration.inSeconds.remainder(60));
    return "${twoDigits(duration.inHours)}:$twoDigitMinutes:$twoDigitSeconds";
  }

  // Placeholder para la lógica de subir imagen
  void _uploadImage(String context) {
    print('Subir imagen para: $context');
  }

  @override
  Widget build(BuildContext context) {
    final item = widget.item;
    // ignore: unused_local_variable
    const String baseUrl = 'https://cmsbackticket.cashmachserv.com/storage/';
    // ignore: unused_local_variable
    final imageUrl = item.imagenTicketClienteGenerada.isNotEmpty
        ? '$baseUrl${item.imagenTicketClienteGenerada}'
        : '';

    // Determinar el color del contador basado en el porcentaje consumido
    final Color timerColor = _getTimerColor(_timeConsumedPercentage);

    // Determinar el texto del tiempo (formateado o tiempo terminado)
    final String timeText = _timeRemaining.inSeconds > 0
        ? _formatDuration(_timeRemaining)
        : '00:00:00 - ¡Tiempo Agotado!';

    return Scaffold(
      appBar: AppBar(
        title: Text(
          '${item.marcaMaquinaria} / ${item.modeloMaquinaria} / ${item.tipoMaquinaria}',
          style: const TextStyle(fontSize: 16),
        ),
        backgroundColor: _getStatusColor(item.estado),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(8.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // 1. Problema del Equipo
            Card(
              elevation: 4,
              child: Padding(
                padding: const EdgeInsets.all(12.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Problema del equipo:',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                        color: Color(0xFF00796B),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      item.descripcionProblema,
                      style: const TextStyle(fontSize: 14),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 10),

            // 2. NEW: Motivo de visita
            _buildDropdown(
              'Motivo de visita',
              _listMotivoVisita,
              _selectedMotivoVisita,
              _isLoadingMotivo,
              (val) => setState(() => _selectedMotivoVisita = val),
              'Seleccione motivo',
            ),
            const SizedBox(height: 10),

            // 3. NEW: Estado de equipo
            _buildDropdown(
              'Estado de equipo',
              _listEstadoEquipo,
              _selectedEstadoEquipo,
              _isLoadingEstado,
              (val) => setState(() => _selectedEstadoEquipo = val),
              'Seleccione estado',
            ),
            const SizedBox(height: 10),

            // 4. OLD: Evaluación del Problema -> RENAMED: Solución implementada
            _buildTextFieldWithCounter(
              'Solución implementada',
              _solucionImplementadaController,
              'Detalle la solución aplicada',
            ),
            const SizedBox(height: 10),

            // 5. OLD: Solución del Problema -> RENAMED: Observación
            _buildTextFieldWithCounter(
              'Observación',
              _observacionController,
              'Observaciones adicionales',
            ),
            const SizedBox(height: 10),

            // 6. NEW: Contador Final y Valor
            Row(
              children: [
                Expanded(
                  child: _buildSimpleTextField(
                    'Contador Final',
                    _contadorFinalController,
                    'Contador',
                    keyboardType: TextInputType.number,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildSimpleTextField(
                    'Valor',
                    _valorController,
                    '0',
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    icon: Icons.attach_money,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // 7. Repuestos
            _buildSectionTitle('Repuestos Requeridos'),
            Card(
              elevation: 4,
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12.0,
                  vertical: 8.0,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      '¿Se utilizaron repuestos?',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    Switch(
                      value: _requiresSpareParts,
                      onChanged: (bool newValue) {
                        setState(() {
                          _requiresSpareParts = newValue;
                        });
                      },
                      activeThumbColor: Colors.green,
                      inactiveThumbColor: Colors.red,
                      inactiveTrackColor: Colors.red[200],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 10),

            // Botón Subir imagen de repuestos (Ahora estirado completamente)
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 300),
              child: _requiresSpareParts
                  ? Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        ElevatedButton.icon(
                          onPressed: () => _pickAndCompressImage('Repuestos'),
                          icon: const Icon(
                            Icons.upload_file,
                            color: Colors.white,
                          ),
                          label: const Text(
                            'Subir Imagen de Repuestos',
                            style: TextStyle(color: Colors.white),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.orange,
                            padding: const EdgeInsets.symmetric(vertical: 15),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                            minimumSize: const Size.fromHeight(50),
                          ),
                        ),
                        _buildImageCounter(_imagesRepuestos),
                      ],
                    )
                  : const SizedBox.shrink(),
            ),
            const SizedBox(height: 20),

            // 8. Botones de Imágenes del Mantenimiento
            _buildSectionTitle('Evidencia Fotográfica'),
            Column(
              children: [
                // Botón Imagen Antes
                ElevatedButton.icon(
                  onPressed: () => _pickAndCompressImage('Antes'),
                  icon: const Icon(Icons.camera_alt, color: Colors.white),
                  label: const Text(
                    'Imágenes del Mantenimiento: ANTES',
                    style: TextStyle(color: Colors.white),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blueGrey,
                    padding: const EdgeInsets.symmetric(vertical: 15),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    minimumSize: const Size.fromHeight(50),
                  ),
                ),
                _buildImageCounter(_imagesAntes),
                const SizedBox(height: 10),
                // Botón Imagen Después
                ElevatedButton.icon(
                  onPressed: () => _pickAndCompressImage('Después'),
                  icon: const Icon(Icons.done_all, color: Colors.white),
                  label: const Text(
                    'Imágenes del Mantenimiento: DESPUÉS',
                    style: TextStyle(color: Colors.white),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.indigo,
                    padding: const EdgeInsets.symmetric(vertical: 15),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    minimumSize: const Size.fromHeight(50),
                  ),
                ),
                _buildImageCounter(_imagesDespues),
              ],
            ),

            const SizedBox(height: 30),

            // 9. Contador y Botón Finalizar
            _buildSectionTitle('Tiempo y Finalización'),
            Card(
              elevation: 4,
              color: Colors.white,
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Expanded(
                      child: Row(
                        children: [
                          Icon(
                            Icons.timer_sharp,
                            color:
                                timerColor, // El icono toma el color del temporizador
                            size: 30,
                          ),
                          const SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                'Tiempo en Tarea:',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.grey[800],
                                ),
                              ),
                              const SizedBox(height: 4),
                              // *** TEXTO DEL CONTADOR FUNCIONAL Y CON COLOR DINÁMICO ***
                              Text(
                                timeText, // Muestra el tiempo restante o "Tiempo Agotado"
                                style: TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.w900,
                                  color: timerColor, // Color dinámico
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    // Botón Finalizar
                    ElevatedButton.icon(
                      onPressed: () async {
                        // VALIDACIÓN
                        if (_selectedMotivoVisita == null ||
                            _selectedEstadoEquipo == null ||
                            _solucionImplementadaController.text.isEmpty ||
                            _contadorFinalController.text.isEmpty) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text(
                                'Por favor complete todos los campos requeridos.',
                              ),
                              backgroundColor: Colors.orange,
                            ),
                          );
                          return;
                        }

                        print('\n======================================================');
                        print('====== INICIO DE FLUJO: FINALIZAR MANTENIMIENTO ======');
                        print('======================================================');

                        // 1. Mostrar diálogo de carga con estado
                        ValueNotifier<String> loadingText =
                            ValueNotifier<String>("Iniciando proceso...");

                        showDialog(
                          context: context,
                          barrierDismissible: false,
                          builder: (BuildContext context) {
                            return AlertDialog(
                              content: Row(
                                children: [
                                  const CircularProgressIndicator(),
                                  const SizedBox(width: 20),
                                  Expanded(
                                    child: ValueListenableBuilder<String>(
                                      valueListenable: loadingText,
                                      builder: (context, val, child) =>
                                          Text(val),
                                    ),
                                  ),
                                ],
                              ),
                            );
                          },
                        );

                        try {
                          final userData = await SessionManager.getUserData();
                          final String coduser = userData['coduser'] ?? '';
                          // xcli parece ser el usuario o cliente, usaremos coduser para usercrea
                          final double valor =
                              double.tryParse(_valorController.text) ?? 0.0;

                          // PROCESO DE SUBIDA DE IMÁGENES
                          print(
                            '\n--> [FLUJO FINALIZAR] 1. Iniciando proceso de subida de imágenes',
                          );
                          final categories = {
                            'MOMARE': _imagesRepuestos,
                            'MOMANT': _imagesAntes,
                            'MOMADE': _imagesDespues,
                          };

                          for (var entry in categories.entries) {
                            String type = entry.key;
                            List<File> images = entry.value;
                            String categoryLabel = type == 'MOMARE'
                                ? 'Repuestos'
                                : (type == 'MOMANT' ? 'Antes' : 'Después');

                            print(
                              '\n--> [FLUJO FINALIZAR] Procesando categoría $categoryLabel ($type). Cantidad de imágenes: ${images.length}',
                            );

                            for (int i = 0; i < images.length; i++) {
                              loadingText.value =
                                  "Subiendo imagen $categoryLabel ${i + 1}/${images.length}...";

                              String fileName = _standardizeFileName(
                                images[i].path,
                                item.idRequer,
                                i,
                                categoryLabel,
                              );
                              print(
                                '--> [FLUJO FINALIZAR] Subiendo imagen $i de $categoryLabel. Archivo: $fileName',
                              );

                              // 1. Subir binario
                              bool uploadSuccess =
                                  await FileMediaService.uploadFile(
                                    file: images[i],
                                    fileName: fileName,
                                    ticketId: item.idRequer,
                                    folderName: categoryLabel,
                                  );

                              print(
                                'DEBUG: Resultado uploadFile para $fileName: $uploadSuccess',
                              );

                              if (uploadSuccess) {
                              // 2. Guardar metadata
                              final metadata = {
                                "usercrea": coduser,
                                "fileUrl": fileName,
                                "idTicketRequerimiento": item.idRequer,
                                "observacion": "",
                                "estado": 1,
                                "permisos": 1,
                                "type": type,
                              };
                              print(
                                '    --> metadata preparada para $fileName',
                              );
                              bool metaSuccess =
                                  await FileMediaService.guardarFileMediaTicketUnit(
                                    metadata,
                                  );
                              print(
                                'DEBUG: Resultado guardarFileMediaTicketUnit para $fileName: $metaSuccess',
                              );
                              } else {
                                print(
                                  'DEBUG: ERROR - No se pudo subir el archivo binario $fileName, saltando metadata',
                                );
                              }

                            }
                          }
                          print(
                            '\n--> [FLUJO FINALIZAR] Fin del proceso de imágenes',
                          );

                          loadingText.value = "Guardando resumen...";

                          // Construir modelo para API Resumen
                          final model = {
                            "idRequerimiento": item.idRequer,
                            "fecrea": DateTime.now().toIso8601String(),
                            "codResuMante": _selectedMotivoVisita,
                            "solucionImplementada":
                                _solucionImplementadaController.text,
                            "usercrea": coduser,
                            "estadoEquip": _selectedEstadoEquipo,
                            "valor": valor,
                            "observacion": _observacionController.text,
                            "estado": 1,
                            "contadorFinal": _contadorFinalController.text,
                          };

                          print(
                            '\n--> [FLUJO FINALIZAR] 2. Guardando Resumen Mantenimiento...',
                          );
                          bool resumenSuccess =
                              await ResumenMantenimientoService.guardarResumenMantenimiento(
                                model,
                              );
                          print(
                            'DEBUG: Resultado guardarResumenMantenimiento: $resumenSuccess',
                          );

                          loadingText.value = "Finalizando cronograma...";

                          // Llamar a la API con tipo 'S' (Salida) del cronograma
                          print(
                            '\n--> [FLUJO FINALIZAR] 3. Actualizando Hora Asignación (Salida)',
                          );
                          final bool success =
                              await CronogramaService.actualizarHoraAsignacion(
                                item.idAsignacionTecnico.toString(),
                                'S',
                              );
                          print(
                            'DEBUG: Resultado actualizarHoraAsignacion (S): $success',
                          );

                          // Cerrar diálogo de carga
                          Navigator.of(context).pop();

                          if (success) {
                            print('\n--> [FLUJO FINALIZAR] 4. Actualizando Estado a 5 (Finalizado)');
                            await _handleStatusUpdate(5);
                            print('======================================================');
                            print('======= FIN DE FLUJO: MANTENIMIENTO COMPLETADO =======');
                            print('======================================================\n');
                            _locationService.stopTracking(); // Detener al finalizar con éxito
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text(
                                  'Mantenimiento y archivos guardados correctamente.',
                                ),
                                backgroundColor: Colors.green,
                              ),
                            );
                            Navigator.of(context).pushNamedAndRemoveUntil(
                              'Dashboard',
                              (route) => false,
                            );
                          } else {
                            _locationService.stopTracking(); // Detener también si falla pero sale
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text(
                                  'Se guardaron los datos pero falló al finalizar el cronograma.',
                                ),
                                backgroundColor: Colors.orange,
                              ),
                            );
                            Navigator.of(context).pushNamedAndRemoveUntil(
                              'Dashboard',
                              (route) => false,
                            );
                          }
                        } catch (e) {
                          Navigator.of(context).pop();
                          _showAlertDialog(
                            'Error',
                            'Ocurrió un error en el proceso: ${e.toString()}',
                            false,
                          );
                        }
                      },
                      icon: const Icon(Icons.save, color: Colors.white),
                      label: const Text(
                        'Finalizar',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.pink,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 15,
                          vertical: 12,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 30), // Espacio al final
          ],
        ),
      ),
    );
  }
}
