import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:sqflite/sqflite.dart';
import 'package:cmsmobile/screens/services/DatabaseHelper.dart';
import 'package:cmsmobile/screens/services/SyncService.dart';

class OfflineDataScreen extends StatefulWidget {
  const OfflineDataScreen({super.key});

  @override
  State<OfflineDataScreen> createState() => _OfflineDataScreenState();
}

class _OfflineDataScreenState extends State<OfflineDataScreen> {
  bool _isLoading = true;
  List<Map<String, dynamic>> _accionesEstado = [];
  List<Map<String, dynamic>> _resumenes = [];
  List<Map<String, dynamic>> _archivos = [];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    
    final dbHelper = DatabaseHelper();
    
    final db = await dbHelper.database;
    final acciones = await dbHelper.getAccionesEstado();
    final resumenes = await dbHelper.getResumenMantenimiento();
    final archivos = await dbHelper.getArchivosPendientes();

    if (mounted) {
      setState(() {
        _accionesEstado = acciones;
        _resumenes = resumenes;
        _archivos = archivos;
        _isLoading = false;
      });
    }
  }

  Future<void> _forceSync() async {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Iniciando envío a la API... Revisar consola.'), duration: Duration(seconds: 2))
    );
    
    // Mostramos un loader momentaneo
    setState(() => _isLoading = true);
    
    await SyncService.syncOfflineData();
    await _loadData(); // recarga la UI para ver si se vaciaron

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Proceso de envío finalizado.'), duration: Duration(seconds: 2))
      );
    }
  }

  Widget _buildSectionHeader(String title, IconData icon, Color color) {
    return Padding(
      padding: const EdgeInsets.only(top: 20, bottom: 10),
      child: Row(
        children: [
          Icon(icon, color: color),
          const SizedBox(width: 10),
          Text(
            title,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Datos Guardados Offline'),
        backgroundColor: Colors.purple.shade700,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadData,
          )
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                   Card(
                    color: Colors.blue.shade50,
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(Icons.info_outline, color: Colors.blue.shade700),
                              const SizedBox(width: 8),
                              const Expanded(
                                child: Text('Resumen General'),
                              ),
                            ],
                          ),
                          const Divider(),
                          Text('• ${_accionesEstado.length} estados/horas en cola'),
                          Text('• ${_resumenes.length} formularios finalizados pendientes'),
                          Text('• ${_archivos.length} archivos y fotos en cola'),
                        ],
                      ),
                    ),
                  ),

                  if (_accionesEstado.isNotEmpty) ...[
                    _buildSectionHeader('Acciones Pendientes', Icons.pending_actions, Colors.orange),
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _accionesEstado.length,
                      itemBuilder: (context, index) {
                        final item = _accionesEstado[index];
                        Map<String, dynamic> payload = {};
                        try {
                          payload = jsonDecode(item['payload'] ?? '{}');
                        } catch (_) {}

                        String titleStr = item['tipo'] == 'asignacion' ? 'Asignación de Técnico' : 'Cambio de Estado';
                        String subStr = '';
                        if (item['tipo'] == 'asignacion') {
                          subStr = 'Actualizado el: ${item['timestamp']}';
                        } else {
                          subStr = 'Mantenimiento #${payload["idMantenimiento"]} ➔ Nuevo Estado: ${payload["nuevoEstado"]}';
                        }

                        return Card(
                          elevation: 2,
                          margin: const EdgeInsets.symmetric(vertical: 4),
                          child: ListTile(
                            leading: Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(color: Colors.orange.shade100, borderRadius: BorderRadius.circular(8)),
                              child: const Icon(Icons.sync_problem, color: Colors.orange),
                            ),
                            title: Text(titleStr, style: const TextStyle(fontWeight: FontWeight.bold)),
                            subtitle: Text(subStr),
                          ),
                        );
                      },
                    ),
                  ],

                  if (_resumenes.isNotEmpty) ...[
                    _buildSectionHeader('Formularios Pendientes', Icons.assignment, Colors.blue),
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _resumenes.length,
                      itemBuilder: (context, index) {
                        final item = _resumenes[index];
                        return Card(
                          elevation: 2,
                          margin: const EdgeInsets.symmetric(vertical: 4),
                          child: ListTile(
                            leading: Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(color: Colors.blue.shade100, borderRadius: BorderRadius.circular(8)),
                              child: const Icon(Icons.assignment_turned_in, color: Colors.blue),
                            ),
                            title: const Text('Formulario de Mantenimiento', style: TextStyle(fontWeight: FontWeight.bold)),
                            subtitle: Text('Ticket Asignado: #${item['ticketId']}\nGuardado el: ${item['timestamp']}'),
                            isThreeLine: true,
                          ),
                        );
                      },
                    ),
                  ],

                  if (_archivos.isNotEmpty) ...[
                    _buildSectionHeader('Archivos Pendientes', Icons.image, Colors.green),
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _archivos.length,
                      itemBuilder: (context, index) {
                        final item = _archivos[index];
                        final bool isMetadataOnly = item['filePath'] == 'metadata_only';
                        
                        Widget leadingIcon;
                        if (isMetadataOnly) {
                          leadingIcon = Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(color: Colors.green.shade100, borderRadius: BorderRadius.circular(8)),
                            child: const Icon(Icons.data_object, color: Colors.green),
                          );
                        } else {
                          leadingIcon = ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: Image.file(
                              File(item['filePath']),
                              width: 50,
                              height: 50,
                              fit: BoxFit.cover,
                              errorBuilder: (c, e, s) => Container(
                                width: 50, height: 50, color: Colors.grey.shade300,
                                child: const Icon(Icons.image_not_supported, color: Colors.grey),
                              ),
                            ),
                          );
                        }

                        String titleStr = '';
                        if (isMetadataOnly) {
                          titleStr = 'Metadatos de Archivo / Foto';
                        } else {
                          titleStr = item['folderName'] == 'Antes' ? 'Fotografía (Antes)' :
                                     item['folderName'] == 'Después' ? 'Fotografía (Después)' : 
                                     'Fotografía / Archivo';
                        }

                        return Card(
                          elevation: 2,
                          margin: const EdgeInsets.symmetric(vertical: 4),
                          child: ListTile(
                            leading: leadingIcon,
                            title: Text(titleStr, style: const TextStyle(fontWeight: FontWeight.bold)),
                            subtitle: Text(isMetadataOnly 
                              ? 'Ticket: #${item['ticketId']}\n(Solo datos estructurales)' 
                              : 'Archivo: ${item['fileName']}\nTicket: #${item['ticketId']}'),
                            isThreeLine: !isMetadataOnly,
                          ),
                        );
                      },
                    ),
                  ],

                  if (_accionesEstado.isEmpty && _resumenes.isEmpty && _archivos.isEmpty)
                     Padding(
                      padding: const EdgeInsets.only(top: 50),
                      child: Center(
                        child: Column(
                          children: [
                            Icon(Icons.check_circle_outline, size: 60, color: Colors.green.shade400),
                            const SizedBox(height: 10),
                            const Text(
                              'No hay datos pendientes por sincronizar.',
                              style: TextStyle(fontSize: 16, color: Colors.grey),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 80), // padding extra para el FAB
                ],
              ),
            ),
      floatingActionButton: _accionesEstado.isNotEmpty || _resumenes.isNotEmpty || _archivos.isNotEmpty
          ? FloatingActionButton.extended(
              onPressed: _forceSync,
              icon: const Icon(Icons.cloud_upload),
              label: const Text('Forzar Sincronización'),
              backgroundColor: Colors.purple.shade700,
              foregroundColor: Colors.white,
            )
          : null,
    );
  }
}
