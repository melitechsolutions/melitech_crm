import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Download, Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

const BackupRestore: React.FC = () => {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [restoreMode, setRestoreMode] = useState<'merge' | 'replace'>('merge');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Queries and mutations
  const createBackup = trpc.importExport.createBackup.useQuery({}, {
    enabled: false,
    retry: false,
  });

  const restoreMutation = trpc.importExport.restoreBackup.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setSelectedFile(null);
      setShowRestoreConfirm(false);
      setIsRestoring(false);
    },
    onError: (error) => {
      toast.error(error.message);
      setIsRestoring(false);
    },
  });

  const handleCreateBackup = async () => {
    try {
      setIsBackingUp(true);
      const result = await createBackup.refetch();
      if (result.data?.backup) {
        const backup = result.data.backup;
        const jsonString = JSON.stringify(backup, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.data.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        setLastBackupDate(new Date().toLocaleString());
        toast.success(`${backup.stats.totalRecords} records from ${backup.stats.tablesBackedUp} tables backed up`);
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create backup');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setSelectedFile(files[0]);
    }
  };

  const handleRestore = async () => {
    if (!selectedFile) {
      toast.error('Please select a backup file to restore');
      return;
    }

    try {
      setIsRestoring(true);
      const fileContent = await selectedFile.text();
      
      restoreMutation.mutate({
        backupData: fileContent,
        mode: restoreMode,
      });
    } catch (error: any) {
      toast.error(error?.message || 'Failed to read backup file');
      setIsRestoring(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Backup Section */}
      <div className="p-6 border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-700">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Create Backup</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Create a complete backup of your database that can be restored later.
            </p>
          </div>

          {lastBackupDate && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm text-green-800 dark:text-green-200">
                Last backup: {lastBackupDate}
              </span>
            </div>
          )}

          <Button
            onClick={handleCreateBackup}
            disabled={isBackingUp}
            className="w-full dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800"
          >
            {isBackingUp ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating backup...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download Backup
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Restore Section */}
      <div className="p-6 border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-700">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Restore from Backup</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Restore your database from a previously created backup file.
            </p>
          </div>

          <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span className="text-sm text-amber-800 dark:text-amber-200">
              Restoring a backup will affect your data. Choose merge mode to add data or replace mode to overwrite.
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Select Backup File</label>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                {selectedFile ? selectedFile.name : 'Choose File'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Restore Mode</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={restoreMode === 'merge'}
                  onChange={() => setRestoreMode('merge')}
                  className="w-4 h-4"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Merge (add new records)
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={restoreMode === 'replace'}
                  onChange={() => setRestoreMode('replace')}
                  className="w-4 h-4"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Replace (overwrite data)
                </span>
              </label>
            </div>
          </div>

          <Button
            onClick={() => setShowRestoreConfirm(true)}
            disabled={!selectedFile || isRestoring}
            className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-900 dark:hover:bg-red-800 text-white"
          >
            {isRestoring ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Restoring...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Restore Backup
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={showRestoreConfirm} onOpenChange={setShowRestoreConfirm}>
        <AlertDialogContent className="dark:bg-slate-800 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-white">Confirm Restore</AlertDialogTitle>
            <AlertDialogDescription className="dark:text-slate-300">
              This will restore your database from the selected backup file. 
              {restoreMode === 'replace' && (
                <span className="block mt-2 font-semibold text-red-600 dark:text-red-400">
                  Warning: Replace mode will overwrite existing data. This action cannot be undone.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-2">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              <strong>File:</strong> {selectedFile?.name}
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              <strong>Mode:</strong> {restoreMode === 'merge' ? 'Merge (Add new records)' : 'Replace (Overwrite data)'}
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestore}
              className={restoreMode === 'replace' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              Confirm Restore
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BackupRestore;
