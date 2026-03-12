import { ModuleLayout } from "@/components/ModuleLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRequireRole } from "@/lib/permissions";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc";
import mutateAsync from '@/lib/mutationHelpers';
import BackupRestore from "@/components/BackupRestore";
import CSVImportExport from "@/components/CSVImportExport";
import { CountrySelect, CitySelect } from "@/components/LocationSelects";
import {
  Settings as SettingsIcon,
  Building2,
  FileText,
  Hash,
  Upload,
  Save,
  Loader2,
  RefreshCw,
  Bell,
  Database,
  FileUp,
} from "lucide-react";

export default function Settings() {
  // Permission check - must be first hook
  const { allowed, isLoading: isLoadingPermission } = useRequireRole(["super_admin", "admin"]);

  // State declarations - ALL at top level before any conditional returns
  const [companyInfo, setCompanyInfo] = useState({
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    companyWebsite: "",
    companyAddress: "",
    companyCity: "",
    companyCountry: "Kenya",
    companyPostalCode: "",
    taxId: "",
    registrationNumber: "",
    companyLogo: "",
  });

  const [bankDetails, setBankDetails] = useState({
    bankName: "",
    bankAccountNumber: "",
    bankBranch: "",
    bankCode: "",
    swiftCode: "",
    iban: "",
  });

  const [documentNumbers, setDocumentNumbers] = useState({
    invoicePrefix: "INV",
    estimatePrefix: "EST",
    receiptPrefix: "REC",
    proposalPrefix: "PROP",
    expensePrefix: "EXP",
  });

  const [notifyPrefs, setNotifyPrefs] = useState({
    invoiceDue: true,
    paymentReceived: true,
    newClient: false,
    companyAnnouncement: false,
  });

  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [isSavingDocs, setIsSavingDocs] = useState(false);

  // Query hooks - ALL at top level
  const { data: companyData, isLoading: loadingCompany, refetch: refetchCompany } = trpc.settings.getCompanyInfo.useQuery();
  const { data: bankData, isLoading: loadingBank, refetch: refetchBank } = trpc.settings.getBankDetails.useQuery();
  const { data: docNumberingData, isLoading: loadingDocs, refetch: refetchDocs } = trpc.settings.getDocumentNumberingSettings.useQuery();
  const { data: notifyData, isLoading: loadingNotify } = trpc.settings.getNotificationPreferences.useQuery();

  // Mutation hooks - ALL at top level
  const updateCompanyMutation = trpc.settings.updateCompanyInfo.useMutation({
    onSuccess: () => {
      toast.success("Company information saved successfully!");
      refetchCompany();
    },
    onError: (error) => {
      toast.error(`Failed to save company information: ${error.message}`);
    },
  });

  const updateBankMutation = trpc.settings.updateBankDetails.useMutation({
    onSuccess: () => {
      toast.success("Bank details saved successfully!");
      refetchBank();
    },
    onError: (error) => {
      toast.error(`Failed to save bank details: ${error.message}`);
    },
  });

  const updateDocPrefixMutation = trpc.settings.updateDocumentPrefix.useMutation({
    onSuccess: () => {
      toast.success("Document prefix updated successfully!");
      refetchDocs();
    },
    onError: (error) => {
      toast.error(`Failed to update document prefix: ${error.message}`);
    },
  });

  const updateNotifyPrefsMutation = trpc.settings.updateNotificationPreferences.useMutation({
    onSuccess: () => {
      toast.success("Notification preferences saved!");
    },
    onError: (error) => {
      toast.error(`Failed to save preferences: ${error.message}`);
    },
  });

  // Effect hooks - ALL at top level
  useEffect(() => {
    if (notifyData) {
      setNotifyPrefs(notifyData);
    }
  }, [notifyData]);

  useEffect(() => {
    if (companyData) {
      setCompanyInfo({
        companyName: companyData.companyName || "",
        companyEmail: companyData.companyEmail || "",
        companyPhone: companyData.companyPhone || "",
        companyWebsite: companyData.companyWebsite || "",
        companyAddress: companyData.companyAddress || "",
        companyCity: companyData.companyCity || "",
        companyCountry: companyData.companyCountry || "Kenya",
        companyPostalCode: companyData.companyPostalCode || "",
        taxId: companyData.taxId || "",
        registrationNumber: companyData.registrationNumber || "",
        companyLogo: companyData.companyLogo || "",
      });
    }
  }, [companyData]);

  useEffect(() => {
    if (bankData) {
      setBankDetails({
        bankName: bankData.bankName || "",
        bankAccountNumber: bankData.bankAccountNumber || "",
        bankBranch: bankData.bankBranch || "",
        bankCode: bankData.bankCode || "",
        swiftCode: bankData.swiftCode || "",
        iban: bankData.iban || "",
      });
    }
  }, [bankData]);

  useEffect(() => {
    if (docNumberingData) {
      setDocumentNumbers({
        invoicePrefix: docNumberingData.invoice_prefix || "INV",
        estimatePrefix: docNumberingData.estimate_prefix || "EST",
        receiptPrefix: docNumberingData.receipt_prefix || "REC",
        proposalPrefix: docNumberingData.proposal_prefix || "PROP",
        expensePrefix: docNumberingData.expense_prefix || "EXP",
      });
    }
  }, [docNumberingData]);

  // NOW: Permission checks and early returns (AFTER all hooks)
  if (isLoadingPermission) return <div className="flex items-center justify-center h-screen"><Spinner className="size-8" /></div>;
  if (!allowed) return null;

  const handleSaveCompany = async () => {
    setIsSavingCompany(true);
    try {
      await mutateAsync(updateCompanyMutation, companyInfo);
    } finally {
      setIsSavingCompany(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo size must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCompanyInfo({ ...companyInfo, companyLogo: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBank = async () => {
    setIsSavingBank(true);
    try {
      await mutateAsync(updateBankMutation, bankDetails);
    } finally {
      setIsSavingBank(false);
    }
  };

  const handleSaveDocPrefix = async (docType: 'invoice' | 'estimate' | 'receipt' | 'proposal' | 'expense', prefix: string) => {
    setIsSavingDocs(true);
    try {
      await mutateAsync(updateDocPrefixMutation, { documentType: docType, prefix });
    } finally {
      setIsSavingDocs(false);
    }
  };

  const isLoadingSettings = loadingCompany || loadingBank || loadingDocs;

  return (
    <ModuleLayout
      title="Settings"
      description="Configure your CRM system and company information"
      icon={<SettingsIcon className="h-5 w-5" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Settings" },
      ]}
    >
      <div className="space-y-6">

        {isLoadingSettings ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2">Loading settings...</span>
          </div>
        ) : (
          <Tabs defaultValue="company" className="space-y-6">
            <TabsList>
              <TabsTrigger value="company">
                <Building2 className="mr-2 h-4 w-4" />
                Company Info
              </TabsTrigger>
              <TabsTrigger value="bank">
                <FileText className="mr-2 h-4 w-4" />
                Bank Details
              </TabsTrigger>
              <TabsTrigger value="numbering">
                <Hash className="mr-2 h-4 w-4" />
                Document Numbering
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="backup">
                <Database className="mr-2 h-4 w-4" />
                Backup & Restore
              </TabsTrigger>
              <TabsTrigger value="csvimport">
                <FileUp className="mr-2 h-4 w-4" />
                CSV Import/Export
              </TabsTrigger>
            </TabsList>

            {/* Company Information Tab */}
            <TabsContent value="company" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>
                    Update your company details that appear on invoices and quotations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        value={companyInfo.companyName}
                        onChange={(e) => setCompanyInfo({ ...companyInfo, companyName: e.target.value })}
                        placeholder="Melitech Solutions"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registrationNumber">Registration Number</Label>
                      <Input
                        id="registrationNumber"
                        value={companyInfo.registrationNumber}
                        onChange={(e) => setCompanyInfo({ ...companyInfo, registrationNumber: e.target.value })}
                        placeholder="Company registration number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyEmail">Email</Label>
                      <Input
                        id="companyEmail"
                        type="email"
                        value={companyInfo.companyEmail}
                        onChange={(e) => setCompanyInfo({ ...companyInfo, companyEmail: e.target.value })}
                        placeholder="info@company.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyPhone">Phone</Label>
                      <Input
                        id="companyPhone"
                        value={companyInfo.companyPhone}
                        onChange={(e) => setCompanyInfo({ ...companyInfo, companyPhone: e.target.value })}
                        placeholder="+254 700 000 000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyWebsite">Website</Label>
                      <Input
                        id="companyWebsite"
                        value={companyInfo.companyWebsite}
                        onChange={(e) => setCompanyInfo({ ...companyInfo, companyWebsite: e.target.value })}
                        placeholder="www.company.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxId">Tax ID / KRA PIN</Label>
                      <Input
                        id="taxId"
                        value={companyInfo.taxId}
                        onChange={(e) => setCompanyInfo({ ...companyInfo, taxId: e.target.value })}
                        placeholder="A123456789X"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Company Logo</Label>
                    <div className="flex items-center gap-6">
                      <div className="h-24 w-24 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                        {companyInfo.companyLogo ? (
                          <img src={companyInfo.companyLogo} alt="Logo" className="h-full w-full object-contain" />
                        ) : (
                          <Building2 className="h-8 w-8 text-gray-300" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="max-w-xs"
                        />
                        <p className="text-xs text-muted-foreground">
                          Recommended: Square or horizontal logo. Max size 2MB.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyAddress">Physical Address</Label>
                    <Textarea
                      id="companyAddress"
                      value={companyInfo.companyAddress}
                      onChange={(e) => setCompanyInfo({ ...companyInfo, companyAddress: e.target.value })}
                      rows={2}
                      placeholder="Street address"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="companyCity">City</Label>
                      <CitySelect
                        value={companyInfo.companyCity}
                        onChange={(value) => setCompanyInfo({ ...companyInfo, companyCity: value })}
                        label=""
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyCountry">Country</Label>
                      <CountrySelect
                        value={companyInfo.companyCountry}
                        onChange={(value) => setCompanyInfo({ ...companyInfo, companyCountry: value })}
                        label=""
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyPostalCode">Postal Code</Label>
                      <Input
                        id="companyPostalCode"
                        value={companyInfo.companyPostalCode}
                        onChange={(e) => setCompanyInfo({ ...companyInfo, companyPostalCode: e.target.value })}
                        placeholder="00100"
                      />
                    </div>
                  </div>

                  <Separator />

                  <Button onClick={handleSaveCompany} disabled={isSavingCompany}>
                    {isSavingCompany ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    {isSavingCompany ? "Saving..." : "Save Company Information"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Bank Details Tab */}
            <TabsContent value="bank" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Bank Account Details</CardTitle>
                  <CardDescription>
                    Payment information displayed on invoices and quotations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Bank Name</Label>
                      <Input
                        id="bankName"
                        value={bankDetails.bankName}
                        onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                        placeholder="Kenya Commercial Bank"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bankBranch">Branch</Label>
                      <Input
                        id="bankBranch"
                        value={bankDetails.bankBranch}
                        onChange={(e) => setBankDetails({ ...bankDetails, bankBranch: e.target.value })}
                        placeholder="Main Branch"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bankAccountNumber">Account Number</Label>
                      <Input
                        id="bankAccountNumber"
                        value={bankDetails.bankAccountNumber}
                        onChange={(e) => setBankDetails({ ...bankDetails, bankAccountNumber: e.target.value })}
                        placeholder="1234567890"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bankCode">Bank Code</Label>
                      <Input
                        id="bankCode"
                        value={bankDetails.bankCode}
                        onChange={(e) => setBankDetails({ ...bankDetails, bankCode: e.target.value })}
                        placeholder="01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="swiftCode">SWIFT Code</Label>
                      <Input
                        id="swiftCode"
                        value={bankDetails.swiftCode}
                        onChange={(e) => setBankDetails({ ...bankDetails, swiftCode: e.target.value })}
                        placeholder="KCBLKENX"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="iban">IBAN</Label>
                      <Input
                        id="iban"
                        value={bankDetails.iban}
                        onChange={(e) => setBankDetails({ ...bankDetails, iban: e.target.value })}
                        placeholder="KE00..."
                      />
                    </div>
                  </div>

                  <Separator />

                  <Button onClick={handleSaveBank} disabled={isSavingBank}>
                    {isSavingBank ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    {isSavingBank ? "Saving..." : "Save Bank Details"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Document Numbering Tab */}
            <TabsContent value="numbering" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Document Number Prefixes</CardTitle>
                  <CardDescription>
                    Configure the prefix for each document type
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
                      <div className="flex gap-2">
                        <Input
                          id="invoicePrefix"
                          value={documentNumbers.invoicePrefix}
                          onChange={(e) => setDocumentNumbers({ ...documentNumbers, invoicePrefix: e.target.value })}
                          placeholder="INV"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSaveDocPrefix('invoice', documentNumbers.invoicePrefix)}
                          disabled={isSavingDocs}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estimatePrefix">Estimate Prefix</Label>
                      <div className="flex gap-2">
                        <Input
                          id="estimatePrefix"
                          value={documentNumbers.estimatePrefix}
                          onChange={(e) => setDocumentNumbers({ ...documentNumbers, estimatePrefix: e.target.value })}
                          placeholder="EST"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSaveDocPrefix('estimate', documentNumbers.estimatePrefix)}
                          disabled={isSavingDocs}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="receiptPrefix">Receipt Prefix</Label>
                      <div className="flex gap-2">
                        <Input
                          id="receiptPrefix"
                          value={documentNumbers.receiptPrefix}
                          onChange={(e) => setDocumentNumbers({ ...documentNumbers, receiptPrefix: e.target.value })}
                          placeholder="REC"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSaveDocPrefix('receipt', documentNumbers.receiptPrefix)}
                          disabled={isSavingDocs}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="proposalPrefix">Proposal Prefix</Label>
                      <div className="flex gap-2">
                        <Input
                          id="proposalPrefix"
                          value={documentNumbers.proposalPrefix}
                          onChange={(e) => setDocumentNumbers({ ...documentNumbers, proposalPrefix: e.target.value })}
                          placeholder="PROP"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSaveDocPrefix('proposal', documentNumbers.proposalPrefix)}
                          disabled={isSavingDocs}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expensePrefix">Expense Prefix</Label>
                      <div className="flex gap-2">
                        <Input
                          id="expensePrefix"
                          value={documentNumbers.expensePrefix}
                          onChange={(e) => setDocumentNumbers({ ...documentNumbers, expensePrefix: e.target.value })}
                          placeholder="EXP"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSaveDocPrefix('expense', documentNumbers.expensePrefix)}
                          disabled={isSavingDocs}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose which events you would like to receive in-app notifications
                    for.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={notifyPrefs.invoiceDue}
                        onCheckedChange={(checked) =>
                          setNotifyPrefs({ ...notifyPrefs, invoiceDue: !!checked })
                        }
                        id="notify-invoice-due"
                      />
                      <Label htmlFor="notify-invoice-due">
                        Invoice due reminders
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={notifyPrefs.paymentReceived}
                        onCheckedChange={(checked) =>
                          setNotifyPrefs({ ...notifyPrefs, paymentReceived: !!checked })
                        }
                        id="notify-payment-received"
                      />
                      <Label htmlFor="notify-payment-received">
                        Payment received alerts
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={notifyPrefs.newClient}
                        onCheckedChange={(checked) =>
                          setNotifyPrefs({ ...notifyPrefs, newClient: !!checked })
                        }
                        id="notify-new-client"
                      />
                      <Label htmlFor="notify-new-client">
                        New client added notifications
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={notifyPrefs.companyAnnouncement}
                        onCheckedChange={(checked) =>
                          setNotifyPrefs({ ...notifyPrefs, companyAnnouncement: !!checked })
                        }
                        id="notify-company-announcement"
                      />
                      <Label htmlFor="notify-company-announcement">
                        Company announcement alerts
                      </Label>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => updateNotifyPrefsMutation.mutate(notifyPrefs)}
                    disabled={updateNotifyPrefsMutation.isPending}
                  >
                    Save Preferences
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Backup & Restore Tab */}
            <TabsContent value="backup" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Database Backup & Restore</CardTitle>
                  <CardDescription>
                    Create backups of your database and restore from previously saved backups
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BackupRestore />
                </CardContent>
              </Card>
            </TabsContent>

            {/* CSV Import/Export Tab */}
            <TabsContent value="csvimport" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>CSV Import/Export</CardTitle>
                  <CardDescription>
                    Import and export data using CSV files
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CSVImportExport />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </ModuleLayout>
  );
}
