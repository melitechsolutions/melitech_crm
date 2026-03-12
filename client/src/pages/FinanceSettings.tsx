import React, { useState } from 'react';
import { trpc } from '../utils/trpc';
import { Download } from 'lucide-react';
import DashboardLayout from "@/components/DashboardLayout";

export const FinanceSettingsPage: React.FC = () => {
  const [vendorId, setVendorId] = useState('');
  const [expenseAccount, setExpenseAccount] = useState('');
  const [payableAccount, setPayableAccount] = useState('');
  const setAccounts = trpc.finance.setVendorAccounts.useMutation();
  const { data: defaults } = trpc.finance.getDefaults.useQuery();
  const vendorQuery = trpc.finance.getVendorAccounts.useQuery(vendorId, { enabled: !!vendorId });
  const listVendors = trpc.finance.listVendorAccounts.useQuery(undefined);
  const [vendorSearch, setVendorSearch] = useState('');
  const [vendorPage, setVendorPage] = useState(0);
  const pageSize = 5;

  const save = async () => {
    await setAccounts.mutateAsync({ vendorId, expenseAccountId: expenseAccount, payableAccountId: payableAccount });
    alert('Saved');
  };

  const [journalId, setJournalId] = useState('');
  const [notesSearch, setNotesSearch] = useState('');
  const reconcile = trpc.finance.reconcileEntry.useMutation();
  const updateRec = trpc.finance.updateReconciliation.useMutation();
  const undoRec = trpc.finance.undoReconciliation.useMutation();
  const { data: recs, refetch: refetchRecs } = trpc.finance.listReconciliations.useQuery(
    journalId || notesSearch ? { journalEntryId: journalId || undefined, notesSearch: notesSearch || undefined } : undefined
  );

  const reconcileNow = async () => {
    if (!journalId) return;
    await reconcile.mutateAsync({ journalEntryId: journalId });
    await refetchRecs();
    alert('Reconciled');
  };

  const doEdit = async (id: string) => {
    const notes = prompt('Enter new notes');
    if (notes === null) return;
    await updateRec.mutateAsync({ id, notes });
    await refetchRecs();
  };

  const doUndo = async (id: string) => {
    if (!confirm('Undo this reconciliation?')) return;
    await undoRec.mutateAsync(id);
    await refetchRecs();
  };

  // when vendorId changes, populate fields if mapping exists
  React.useEffect(() => {
    if (vendorQuery.data) {
      setExpenseAccount(vendorQuery.data.expense || '');
      setPayableAccount(vendorQuery.data.payable || '');
    }
  }, [vendorQuery.data]);

  return (
    <DashboardLayout>
      <div>
      <h1>Finance Settings</h1>
      {defaults && (
        <div>
          <h3>Default Accounts</h3>
          <div>Expense: {defaults.expense || '<none>'}</div>
          <div>Payable: {defaults.payable || '<none>'}</div>
        </div>
      )}
      <div>
        <label>Vendor ID</label>
        <input value={vendorId} onChange={e => setVendorId(e.target.value)} />
      </div>
      <div>
        <label>Expense Account</label>
        <input value={expenseAccount} onChange={e => setExpenseAccount(e.target.value)} />
      </div>
      <div>
        <label>Payable Account</label>
        <input value={payableAccount} onChange={e => setPayableAccount(e.target.value)} />
      </div>
      <button onClick={save}>Save</button>
      <div>
        <button onClick={() => listVendors.refetch()}>Refresh Vendor List</button>
        <button onClick={async () => {
          const exp = await trpc.finance.exportVendorAccounts.query();
          console.log('export data', exp);
          alert('Check console for export');
        }}>Export Settings</button>
        <div>
          <label>Search vendors:</label>
          <input value={vendorSearch} onChange={e => { setVendorSearch(e.target.value); setVendorPage(0); }} />
        </div>
        {listVendors.data && (() => {
          const filtered = listVendors.data.filter(v => v.vendorId.includes(vendorSearch));
          const paged = filtered.slice(vendorPage * pageSize, vendorPage * pageSize + pageSize);
          return (
            <>
              <table>
                <thead><tr><th>Vendor</th><th>Expense</th><th>Payable</th></tr></thead>
                <tbody>
                  {paged.map(v => (
                    <tr key={v.vendorId}>
                      <td>{v.vendorId}</td>
                      <td>{v.expense || '-'}</td>
                      <td>{v.payable || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div>
                <button disabled={vendorPage === 0} onClick={() => setVendorPage(p => p - 1)}>Prev</button>
                <button disabled={(vendorPage + 1) * pageSize >= filtered.length} onClick={() => setVendorPage(p => p + 1)}>Next</button>
              </div>
            </>
          );
        })()}
      </div>

      <h2>Reconciliation</h2>
      <div>
        <label>Journal Entry ID</label>
        <input value={journalId} onChange={e => setJournalId(e.target.value)} />
        <button onClick={reconcileNow}>Reconcile</button>
      </div>
      <div>
        <label>Search notes:</label>
        <input value={notesSearch} onChange={e => setNotesSearch(e.target.value)} />
        <button onClick={() => refetchRecs()}>Filter</button>
        <button onClick={async () => {
          const exp = await trpc.finance.exportReconciliations.query({ journalEntryId: journalId || undefined });
          console.log('reconciliation export', exp);
          alert('Check console for reconciliation export');
        }}>Export CSV</button>
      </div>
      <table>
        <thead><tr><th>ID</th><th>Entry</th><th>By</th><th>When</th><th>Notes</th><th>Actions</th></tr></thead>
        <tbody>
          {Array.isArray(recs) && recs.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.journalEntryId}</td>
              <td>{r.reconciledBy}</td>
              <td>{new Date(r.reconciledAt).toLocaleString()}</td>
              <td>{r.notes || '-'}</td>
              <td>
                <button onClick={() => doEdit(r.id)}>Edit</button>
                <button onClick={() => doUndo(r.id)}>Undo</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </DashboardLayout>
  );
};