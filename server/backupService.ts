import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import archiver from 'archiver';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface BackupItem {
  id: string;
  type: 'full' | 'database' | 'files' | 'config';
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  createdAt: string;
  completedAt?: string;
  size?: string;
  downloadUrl?: string;
  error?: string;
}

class BackupService {
  private backups: Map<string, BackupItem> = new Map();
  private backupDir = path.join(process.cwd(), 'backups');

  constructor() {
    this.ensureBackupDirectory();
  }

  private async ensureBackupDirectory() {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create backup directory:', error);
    }
  }

  async createBackup(type: string): Promise<string> {
    const backupId = randomUUID();
    const backup: BackupItem = {
      id: backupId,
      type: type as any,
      status: 'pending',
      progress: 0,
      createdAt: new Date().toISOString(),
    };

    this.backups.set(backupId, backup);

    // Start backup process asynchronously
    this.processBackup(backupId).catch(error => {
      console.error(`Backup ${backupId} failed:`, error);
      const failedBackup = this.backups.get(backupId);
      if (failedBackup) {
        failedBackup.status = 'failed';
        failedBackup.error = error.message;
        this.backups.set(backupId, failedBackup);
      }
    });

    return backupId;
  }

  private async processBackup(backupId: string) {
    const backup = this.backups.get(backupId);
    if (!backup) throw new Error('Backup not found');

    backup.status = 'running';
    this.backups.set(backupId, backup);

    const backupPath = path.join(this.backupDir, `${backupId}.zip`);
    const output = await fs.open(backupPath, 'w');
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.pipe(output.createWriteStream());

    try {
      switch (backup.type) {
        case 'full':
          await this.createFullBackup(archive, backup);
          break;
        case 'database':
          await this.createDatabaseBackup(archive, backup);
          break;
        case 'files':
          await this.createFilesBackup(archive, backup);
          break;
        case 'config':
          await this.createConfigBackup(archive, backup);
          break;
        default:
          throw new Error('Invalid backup type');
      }

      await archive.finalize();
      await output.close();

      // Get file size
      const stats = await fs.stat(backupPath);
      const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

      backup.status = 'completed';
      backup.progress = 100;
      backup.completedAt = new Date().toISOString();
      backup.size = `${sizeInMB} MB`;
      backup.downloadUrl = `/api/admin/backups/${backupId}/download`;

      this.backups.set(backupId, backup);
    } catch (error) {
      await output.close();
      // Clean up failed backup file
      try {
        await fs.unlink(backupPath);
      } catch (unlinkError) {
        console.error('Failed to clean up backup file:', unlinkError);
      }
      throw error;
    }
  }

  private async createFullBackup(archive: archiver.Archiver, backup: BackupItem) {
    backup.progress = 10;
    this.backups.set(backup.id, backup);

    // Add database dump
    await this.addDatabaseToArchive(archive);
    backup.progress = 40;
    this.backups.set(backup.id, backup);

    // Add application files
    await this.addApplicationFiles(archive);
    backup.progress = 70;
    this.backups.set(backup.id, backup);

    // Add configuration
    await this.addConfigFiles(archive);
    backup.progress = 90;
    this.backups.set(backup.id, backup);
  }

  private async createDatabaseBackup(archive: archiver.Archiver, backup: BackupItem) {
    backup.progress = 20;
    this.backups.set(backup.id, backup);

    await this.addDatabaseToArchive(archive);
    
    backup.progress = 90;
    this.backups.set(backup.id, backup);
  }

  private async createFilesBackup(archive: archiver.Archiver, backup: BackupItem) {
    backup.progress = 20;
    this.backups.set(backup.id, backup);

    await this.addApplicationFiles(archive);
    
    backup.progress = 90;
    this.backups.set(backup.id, backup);
  }

  private async createConfigBackup(archive: archiver.Archiver, backup: BackupItem) {
    backup.progress = 30;
    this.backups.set(backup.id, backup);

    await this.addConfigFiles(archive);
    
    backup.progress = 90;
    this.backups.set(backup.id, backup);
  }

  private async addDatabaseToArchive(archive: archiver.Archiver) {
    try {
      // Create PostgreSQL dump
      const dumpPath = path.join(this.backupDir, 'temp_database.sql');
      
      if (process.env.DATABASE_URL) {
        // Use pg_dump to create database backup
        const command = `pg_dump "${process.env.DATABASE_URL}" > "${dumpPath}"`;
        await execAsync(command);
        
        // Add to archive
        archive.file(dumpPath, { name: 'database/database.sql' });
        
        // Clean up temp file after adding to archive
        setTimeout(async () => {
          try {
            await fs.unlink(dumpPath);
          } catch (error) {
            console.error('Failed to clean up temp database file:', error);
          }
        }, 1000);
      } else {
        // Fallback: create a JSON export of key data
        const dataExport = await this.createJSONDataExport();
        archive.append(JSON.stringify(dataExport, null, 2), { name: 'database/data_export.json' });
      }
    } catch (error) {
      console.error('Database backup failed:', error);
      // Create minimal backup info
      archive.append(JSON.stringify({ 
        error: 'Database backup failed', 
        timestamp: new Date().toISOString() 
      }, null, 2), { name: 'database/backup_error.json' });
    }
  }

  private async createJSONDataExport() {
    // This would export key application data in JSON format
    // For now, return basic structure
    return {
      exportedAt: new Date().toISOString(),
      tables: {
        properties: [],
        users: [],
        orders: [],
        notifications: []
      },
      note: "This is a JSON fallback export. For complete database backup, ensure DATABASE_URL is configured."
    };
  }

  private async addApplicationFiles(archive: archiver.Archiver) {
    const filesToBackup = [
      'client',
      'server',
      'shared',
      'package.json',
      'package-lock.json',
      'tsconfig.json',
      'vite.config.ts',
      'tailwind.config.ts',
      'drizzle.config.ts'
    ];

    for (const item of filesToBackup) {
      const itemPath = path.join(process.cwd(), item);
      
      try {
        const stats = await fs.stat(itemPath);
        
        if (stats.isDirectory()) {
          archive.directory(itemPath, `application/${item}`);
        } else {
          archive.file(itemPath, { name: `application/${item}` });
        }
      } catch (error) {
        console.warn(`Could not backup ${item}:`, error);
      }
    }
  }

  private async addConfigFiles(archive: archiver.Archiver) {
    const configFiles = [
      '.replit',
      'replit.md',
      'components.json',
      'postcss.config.js'
    ];

    // Add environment variables (sanitized)
    const envData = {
      NODE_ENV: process.env.NODE_ENV,
      // Add other non-sensitive env vars as needed
      BACKUP_CREATED_AT: new Date().toISOString()
    };
    
    archive.append(JSON.stringify(envData, null, 2), { name: 'config/environment.json' });

    // Add config files
    for (const configFile of configFiles) {
      const configPath = path.join(process.cwd(), configFile);
      
      try {
        await fs.access(configPath);
        archive.file(configPath, { name: `config/${configFile}` });
      } catch (error) {
        console.warn(`Could not backup config file ${configFile}:`, error);
      }
    }
  }

  getBackupHistory(): BackupItem[] {
    return Array.from(this.backups.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getBackup(id: string): BackupItem | undefined {
    return this.backups.get(id);
  }

  async getBackupFilePath(id: string): Promise<string | null> {
    const backup = this.backups.get(id);
    if (!backup || backup.status !== 'completed') {
      return null;
    }

    const backupPath = path.join(this.backupDir, `${id}.zip`);
    
    try {
      await fs.access(backupPath);
      return backupPath;
    } catch (error) {
      return null;
    }
  }

  async deleteOldBackups(daysToKeep: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    for (const [id, backup] of Array.from(this.backups.entries())) {
      const backupDate = new Date(backup.createdAt);
      
      if (backupDate < cutoffDate) {
        // Delete backup file
        const backupPath = path.join(this.backupDir, `${id}.zip`);
        try {
          await fs.unlink(backupPath);
        } catch (error) {
          console.warn(`Could not delete backup file ${id}:`, error);
        }
        
        // Remove from memory
        this.backups.delete(id);
      }
    }
  }
}

export const backupService = new BackupService();