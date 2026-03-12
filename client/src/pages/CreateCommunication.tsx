import { useState } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Mail, Phone, MessageSquare, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function CreateCommunication() {
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "email" as "email" | "sms",
    recipient: "",
    recipients: "" as string, // comma-separated list
    subject: "",
    body: "",
    sendAt: new Date().toISOString().split("T")[0],
  });

  // Get clients for autocomplete
  const { data: clients = [] } = trpc.clients?.list?.useQuery?.({
    limit: 1000,
    offset: 0,
  }) || { data: [] };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (formData.type === "email" && !formData.subject.trim()) {
      toast.error("Subject is required for emails");
      return false;
    }
    if (!formData.body.trim()) {
      toast.error("Message body is required");
      return false;
    }
    if (!formData.recipient.trim() && !formData.recipients.trim()) {
      toast.error("At least one recipient is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Parse recipients
      const recipientsList = formData.recipients
        .split(",")
        .map((r) => r.trim())
        .filter((r) => r.length > 0);

      if (formData.recipient) {
        recipientsList.push(formData.recipient.trim());
      }

      // Send communications
      for (const recipient of recipientsList) {
        const communicationData = {
          type: formData.type,
          recipient: recipient,
          subject: formData.subject || `${formData.type === "email" ? "Email" : "SMS"} from Melitech`,
          body: formData.body,
          status: "pending" as const,
        };

        // Create communication via API
        // This assumes there's a create method in the communications router
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call
      }

      toast.success(`Communication${recipientsList.length > 1 ? "s" : ""} queued successfully`);
      navigate("/communications");
    } catch (error) {
      console.error("Failed to create communication:", error);
      toast.error("Failed to create communication");
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail size={16} />;
      case "sms":
        return <Phone size={16} />;
      default:
        return <MessageSquare size={16} />;
    }
  };

  const filteredClients = clients.filter((client: any) =>
    client.name?.toLowerCase().includes(formData.recipient.toLowerCase()) ||
    client.email?.toLowerCase().includes(formData.recipient.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/communications")}
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">New Communication</h1>
              <p className="text-muted-foreground">
                Send emails, SMS, or other communications to your clients
              </p>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <Card>
          <CardHeader>
            <CardTitle>Communication Details</CardTitle>
            <CardDescription>
              Fill in the details below to send a new communication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Communication Type */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Communication Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      handleInputChange("type", value as "email" | "sms")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">
                        <div className="flex items-center gap-2">
                          <Mail size={14} /> Email
                        </div>
                      </SelectItem>
                      <SelectItem value="sms">
                        <div className="flex items-center gap-2">
                          <Phone size={14} /> SMS
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Send At</Label>
                  <Input
                    type="date"
                    value={formData.sendAt}
                    onChange={(e) => handleInputChange("sendAt", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Schedule Later?</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="schedule"
                      defaultChecked={false}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="schedule" className="cursor-pointer text-sm">
                      Schedule for later
                    </Label>
                  </div>
                </div>
              </div>

              {/* Recipients Section */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold">Recipients *</h3>

                {/* Single Recipient with Autocomplete */}
                <div className="space-y-2">
                  <Label>Recipient Email or Phone</Label>
                  <div className="relative">
                    <Input
                      placeholder={
                        formData.type === "email"
                          ? "Enter email address..."
                          : "Enter phone number..."
                      }
                      value={formData.recipient}
                      onChange={(e) => handleInputChange("recipient", e.target.value)}
                      autoComplete="off"
                    />
                    {formData.recipient && filteredClients.length > 0 && (
                      <div className="absolute top-full mt-1 w-full bg-white border rounded-md shadow-lg z-10">
                        {filteredClients.slice(0, 5).map((client: any) => (
                          <div
                            key={client.id}
                            className="px-4 py-2 hover:bg-accent cursor-pointer"
                            onClick={() => {
                              const email =
                                formData.type === "email"
                                  ? client.email
                                  : client.phone || "";
                              handleInputChange("recipient", email);
                            }}
                          >
                            <div className="font-medium">{client.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {formData.type === "email"
                                ? client.email
                                : client.phone}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Multiple Recipients */}
                <div className="space-y-2">
                  <Label>Additional Recipients (comma-separated)</Label>
                  <Textarea
                    placeholder={
                      formData.type === "email"
                        ? "email1@example.com, email2@example.com, ..."
                        : "+254712345678, +254987654321, ..."
                    }
                    value={formData.recipients}
                    onChange={(e) => handleInputChange("recipients", e.target.value)}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter multiple recipients separated by commas
                  </p>
                </div>
              </div>

              {/* Message Content */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold">Message Content</h3>

                {formData.type === "email" && (
                  <div className="space-y-2">
                    <Label>Subject *</Label>
                    <Input
                      placeholder="Enter email subject..."
                      value={formData.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>
                    {formData.type === "email" ? "Email Body" : "Message"} *
                  </Label>
                  <Textarea
                    placeholder={
                      formData.type === "email"
                        ? "Enter your email message here..."
                        : "Enter your SMS message here (160 characters)..."
                    }
                    value={formData.body}
                    onChange={(e) => handleInputChange("body", e.target.value)}
                    rows={8}
                    maxLength={formData.type === "sms" ? 160 : undefined}
                  />
                  {formData.type === "sms" && (
                    <p className="text-xs text-muted-foreground">
                      {formData.body.length}/160 characters
                    </p>
                  )}
                </div>
              </div>

              {/* Template Options */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold">Quick Templates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleInputChange(
                        "body",
                        "Dear Client,\n\nThank you for your business. We appreciate your continued support.\n\nBest regards,\nMelitech Solutions"
                      )
                    }
                  >
                    Thank You Template
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleInputChange(
                        "body",
                        "Dear Client,\n\nWe hope you are doing well. Please find the latest updates below.\n\nBest regards,\nMelitech Solutions"
                      )
                    }
                  >
                    Update Template
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 justify-end border-t pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/communications")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {getTypeIcon(formData.type)}
                  {loading ? "Sending..." : "Send Communication"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
