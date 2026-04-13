import 'dart:async';
import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';

class DatabaseHelper {
  static final DatabaseHelper _instance = DatabaseHelper._internal();
  factory DatabaseHelper() => _instance;
  DatabaseHelper._internal();

  static Database? _database;

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    String path = join(await getDatabasesPath(), 'offline_locations_cms.db');
    return await openDatabase(
      path,
      version: 2, // Incremented version
      onCreate: _onCreate,
      onUpgrade: _onUpgrade,
    );
  }

  Future _onCreate(Database db, int version) async {
    await db.execute('''
      CREATE TABLE offline_locations(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticketId INTEGER,
        tecnicoId INTEGER,
        latitud REAL,
        longitud REAL,
        mac TEXT,
        coduser TEXT,
        tipo TEXT, 
        timestamp TEXT
      )
    ''');
    
    await _createCronogramaTables(db);
  }

  Future _onUpgrade(Database db, int oldVersion, int newVersion) async {
    if (oldVersion < 2) {
      await _createCronogramaTables(db);
    }
  }

  Future _createCronogramaTables(Database db) async {
    // Cache the CronogramaItem list received from API
    await db.execute('''
      CREATE TABLE offline_cronogramas(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        coduser TEXT,
        companyCode TEXT,
        jsonModel TEXT,
        timestamp TEXT
      )
    ''');

    // Queue for Mantenimiento status and assigned hour updates
    await db.execute('''
      CREATE TABLE offline_acciones_estado(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tipo TEXT,
        payload TEXT,
        timestamp TEXT
      )
    ''');

    // Queue for ResumenMantenimiento submissions
    await db.execute('''
      CREATE TABLE offline_resumen_mantenimiento(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticketId INTEGER,
        payload TEXT,
        timestamp TEXT
      )
    ''');

    // Queue for file uploads + metadata
    await db.execute('''
      CREATE TABLE offline_archivos(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticketId INTEGER,
        filePath TEXT,
        fileName TEXT,
        folderName TEXT,
        isUploaded INTEGER,
        metadataJson TEXT,
        timestamp TEXT
      )
    ''');
  }

  // --- LOCATION METHODS ---
  Future<int> insertLocation(Map<String, dynamic> location) async {
    print('==================================================');
    print('💾 ❌ SIN CONEXIÓN: ENVIANDO DATOS LOCAL A SQLITE (Ubicación)...');
    print('==================================================');
    Database db = await database;
    return await db.insert('offline_locations', location);
  }

  Future<List<Map<String, dynamic>>> getLocations() async {
    Database db = await database;
    return await db.query('offline_locations', orderBy: 'id ASC');
  }

  Future<int> deleteLocation(int id) async {
    Database db = await database;
    return await db.delete('offline_locations', where: 'id = ?', whereArgs: [id]);
  }

  // --- CRONOGRAMA METHODS ---
  Future<int> insertCronogramas(String coduser, String companyCode, String jsonModel) async {
    Database db = await database;
    // Clear old for this user/company
    await db.delete('offline_cronogramas',
        where: 'coduser = ? AND companyCode = ?', whereArgs: [coduser, companyCode]);
    
    return await db.insert('offline_cronogramas', {
      'coduser': coduser,
      'companyCode': companyCode,
      'jsonModel': jsonModel,
      'timestamp': DateTime.now().toIso8601String(),
    });
  }

  Future<List<Map<String, dynamic>>> getCronogramas(String coduser, String companyCode) async {
    Database db = await database;
    return await db.query('offline_cronogramas',
        where: 'coduser = ? AND companyCode = ?',
        whereArgs: [coduser, companyCode],
        orderBy: 'id DESC',
        limit: 1); // Get latest
  }

  // --- OFF ACTIONS ---
  Future<int> insertAccionEstado(String tipo, String payload) async {
    Database db = await database;
    return await db.insert('offline_acciones_estado', {
      'tipo': tipo,
      'payload': payload,
      'timestamp': DateTime.now().toIso8601String(),
    });
  }

  Future<List<Map<String, dynamic>>> getAccionesEstado() async {
    Database db = await database;
    return await db.query('offline_acciones_estado', orderBy: 'id ASC');
  }

  Future<int> deleteAccionEstado(int id) async {
    Database db = await database;
    return await db.delete('offline_acciones_estado', where: 'id = ?', whereArgs: [id]);
  }

  // --- RESUMEN DE MANTENIMIENTO ---
  Future<int> insertResumenMantenimiento(int ticketId, String payload) async {
    Database db = await database;
    return await db.insert('offline_resumen_mantenimiento', {
      'ticketId': ticketId,
      'payload': payload,
      'timestamp': DateTime.now().toIso8601String(),
    });
  }

  Future<List<Map<String, dynamic>>> getResumenMantenimiento() async {
    Database db = await database;
    return await db.query('offline_resumen_mantenimiento', orderBy: 'id ASC');
  }

  Future<int> deleteResumenMantenimiento(int id) async {
    Database db = await database;
    return await db.delete('offline_resumen_mantenimiento', where: 'id = ?', whereArgs: [id]);
  }

  // --- ARCHIVOS ---
  Future<int> insertArchivo(int ticketId, String filePath, String fileName, String folderName, String metadataJson) async {
    Database db = await database;
    return await db.insert('offline_archivos', {
      'ticketId': ticketId,
      'filePath': filePath,
      'fileName': fileName,
      'folderName': folderName,
      'isUploaded': 0, // 0 = false, 1 = true
      'metadataJson': metadataJson,
      'timestamp': DateTime.now().toIso8601String(),
    });
  }

  Future<List<Map<String, dynamic>>> getArchivosPendientes() async {
    Database db = await database;
    return await db.query('offline_archivos', where: 'isUploaded = 0', orderBy: 'id ASC');
  }

  Future<int> deleteArchivo(int id) async {
    Database db = await database;
    return await db.delete('offline_archivos', where: 'id = ?', whereArgs: [id]);
  }
}
