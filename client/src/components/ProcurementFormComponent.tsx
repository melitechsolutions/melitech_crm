import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus } from "lucide-react";

export interface LineItem {
  itemNumber: string;
  itemName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  discountPercent: number;
  amount: number;
}

interface ProcurementFormProps {
  title: string;
  type: "lpo" | "imprest" | "purchase-order";
  onSubmit: (data: any) => void;
}

export function ProcurementFormComponent({ title, type, onSubmit }: ProcurementFormProps) {
  const [formData, setFormData] = useState({
    documentNumber: "",
    supplier: "",
    supplierContact: "",
    deliveryAddress: "",
    deliveryDate: "",
    notes: "",
    lineItems: [
      {
        itemNumber: "001",
        itemName: "",
        description: "",
        quantity: 0,
        unitPrice: 0,
        discount: 0,
        discountPercent: 0,
        amount: 0,
      },
    ] as LineItem[],
  });

  const addLineItem = () => {
    setFormData((prev) => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        {
          itemNumber: String(prev.lineItems.length + 1).padStart(3, "0"),
          itemName: "",
          description: "",
          quantity: 0,
          unitPrice: 0,
          discount: 0,
          discountPercent: 0,
          amount: 0,
        },
      ],
    }));
  };

  const removeLineItem = (index: number) => {
    if (formData.lineItems.length > 1) {
      setFormData((prev) => ({
        ...prev,
        lineItems: prev.lineItems.filter((_, i) => i !== index),
      }));
    }
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    setFormData((prev) => {
      const items = [...prev.lineItems];
      const item = { ...items[index], [field]: value };

      // Calculate amount based on quantity, unit price, and discount
      if (field === "quantity" || field === "unitPrice" || field === "discountPercent") {
        const subtotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
        const discountAmount = subtotal * ((Number(item.discountPercent) || 0) / 100);
        item.discount = Math.round(discountAmount * 100) / 100;
        item.amount = Math.round((subtotal - item.discount) * 100) / 100;
      } else if (field === "discount") {
        const subtotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
        item.discount = Number(value);
        item.discountPercent = subtotal > 0 ? Math.round((item.discount / subtotal) * 10000) / 100 : 0;
        item.amount = Math.round((subtotal - item.discount) * 100) / 100;
      }

      items[index] = item;
      return { ...prev, lineItems: items };
    });
  };

  const totalAmount = formData.lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalDiscount = formData.lineItems.reduce((sum, item) => sum + (item.discount || 0), 0);
  const subtotal = formData.lineItems.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
    0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Document Number *
            </label>
            <Input
              type="text"
              value={formData.documentNumber}
              onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
              placeholder="Auto-generated"
              disabled
              className="bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Supplier/Vendor *
            </label>
            <Input
              type="text"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              placeholder="Select supplier"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Contact Person
            </label>
            <Input
              type="text"
              value={formData.supplierContact}
              onChange={(e) => setFormData({ ...formData, supplierContact: e.target.value })}
              placeholder="Contact person name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Delivery Date *
            </label>
            <Input
              type="date"
              value={formData.deliveryDate}
              onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Delivery Address *
            </label>
            <Input
              type="text"
              value={formData.deliveryAddress}
              onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
              placeholder="Complete delivery address"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes or special instructions"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Line Items Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Line Items</CardTitle>
          <Button
            type="button"
            onClick={addLineItem}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                  <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">
                    Item #
                  </th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">
                    Item Name *
                  </th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">
                    Description
                  </th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">
                    Qty *
                  </th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">
                    Unit Price *
                  </th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">
                    Discount %
                  </th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">
                    Amount
                  </th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {formData.lineItems.map((item, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="py-3 px-2">
                      <span className="text-gray-600 dark:text-gray-400">{item.itemNumber}</span>
                    </td>
                    <td className="py-3 px-2">
                      <Input
                        type="text"
                        value={item.itemName}
                        onChange={(e) => updateLineItem(idx, "itemName", e.target.value)}
                        placeholder="Item name"
                        required
                        className="w-full"
                      />
                    </td>
                    <td className="py-3 px-2">
                      <Input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateLineItem(idx, "description", e.target.value)}
                        placeholder="Description"
                        className="w-full"
                      />
                    </td>
                    <td className="py-3 px-2">
                      <Input
                        type="number"
                        value={item.quantity || ""}
                        onChange={(e) => updateLineItem(idx, "quantity", parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        step="0.01"
                        min="0"
                        required
                        className="w-full text-right"
                      />
                    </td>
                    <td className="py-3 px-2">
                      <Input
                        type="number"
                        value={item.unitPrice || ""}
                        onChange={(e) => updateLineItem(idx, "unitPrice", parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        required
                        className="w-full text-right"
                      />
                    </td>
                    <td className="py-3 px-2">
                      <Input
                        type="number"
                        value={item.discountPercent || ""}
                        onChange={(e) => updateLineItem(idx, "discountPercent", parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        step="0.01"
                        min="0"
                        max="100"
                        className="w-full text-right"
                      />
                    </td>
                    <td className="py-3 px-2 text-right font-semibold text-gray-900 dark:text-white">
                      {item.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeLineItem(idx)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                        disabled={formData.lineItems.length === 1}
                        title="Remove item"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Section */}
          <div className="mt-6 space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex justify-end gap-4">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total Discount:</span>
                  <span className="font-medium text-orange-600 dark:text-orange-400">
                    -{totalDiscount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-700 pt-2">
                  <span className="text-gray-900 dark:text-white">Total Amount:</span>
                  <span className="text-blue-600 dark:text-blue-400">{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline">
          Save as Draft
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          Submit for Approval
        </Button>
      </div>
    </form>
  );
}
