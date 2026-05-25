"use client";

import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AccountFormProps {
  onClose: () => void;
  account?: {
    _id: Id<"accounts">;
    name: string;
    startingBalance: number;
    currency: string;
    leverage?: number;
  };
}

const currencies = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "NZD", "CHF"];

export function AccountForm({ onClose, account }: AccountFormProps) {
  const createAccount = useMutation(api.accounts.create);
  const updateAccount = useMutation(api.accounts.update);

  const [formData, setFormData] = useState({
    name: account?.name || "",
    startingBalance: account?.startingBalance || 1000,
    currency: account?.currency || "USD",
    leverage: account?.leverage?.toString() || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = {
        name: formData.name,
        startingBalance: Number(formData.startingBalance),
        currency: formData.currency,
        leverage: formData.leverage ? Number(formData.leverage) : undefined,
      };

      if (account?._id) {
        await updateAccount({ id: account._id, updates: data });
      } else {
        await createAccount(data);
      }
      onClose();
    } catch (error) {
      console.error("Failed to save account:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{account ? "Edit Account" : "Create Account"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="account-name">Account Name</Label>
            <Input
              id="account-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Binance Futures"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="starting-balance">Starting Balance</Label>
              <Input
                id="starting-balance"
                type="number"
                step="0.01"
                value={formData.startingBalance}
                onChange={(e) =>
                  setFormData({ ...formData, startingBalance: Number(e.target.value) })
                }
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="leverage">Leverage (optional)</Label>
            <Input
              id="leverage"
              type="number"
              value={formData.leverage}
              onChange={(e) => setFormData({ ...formData, leverage: e.target.value })}
              placeholder="e.g., 100"
            />
          </div>

          <DialogFooter className="border-0 bg-transparent p-0 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {account ? "Update Account" : "Create Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
