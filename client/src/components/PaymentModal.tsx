import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X, Lock } from "lucide-react";
import { toast } from "sonner";

interface PaymentModalProps {
  total: number;
  onClose: () => void;
  onSubmit: (paymentData: any) => Promise<void>;
  isLoading: boolean;
}

export default function PaymentModal({ total, onClose, onSubmit, isLoading }: PaymentModalProps) {
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, "").length !== 16) {
      newErrors.cardNumber = "Número de tarjeta inválido (16 dígitos)";
    }

    if (!formData.cardHolder || formData.cardHolder.trim().length < 3) {
      newErrors.cardHolder = "Nombre del titular inválido";
    }

    if (!formData.expiryDate || !/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = "Formato MM/YY requerido";
    }

    if (!formData.cvv || formData.cvv.length !== 3) {
      newErrors.cvv = "CVV debe tener 3 dígitos";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s/g, "");
    if (!/^\d*$/.test(value)) return;
    if (value.length > 16) value = value.slice(0, 16);

    // Formatear cada 4 dígitos
    const formatted = value.replace(/(\d{4})(?=\d)/g, "$1 ");
    setFormData({ ...formData, cardNumber: formatted });
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);

    if (value.length >= 2) {
      value = value.slice(0, 2) + "/" + value.slice(2);
    }

    setFormData({ ...formData, expiryDate: value });
  };

  const handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 3) value = value.slice(0, 3);
    setFormData({ ...formData, cvv: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Por favor, completa el formulario correctamente");
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error: any) {
      toast.error(error.message || "Error al procesar el pago");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-bold">Pago Seguro</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Total */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Monto a pagar</p>
            <p className="text-3xl font-bold text-blue-600">€{total.toFixed(2)}</p>
          </div>

          {/* Card Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Número de Tarjeta
            </label>
            <Input
              type="text"
              placeholder="1234 5678 9012 3456"
              value={formData.cardNumber}
              onChange={handleCardNumberChange}
              disabled={isLoading}
              className={errors.cardNumber ? "border-red-500" : ""}
            />
            {errors.cardNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
            )}
          </div>

          {/* Card Holder */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Nombre del Titular
            </label>
            <Input
              type="text"
              placeholder="JUAN PEREZ"
              value={formData.cardHolder}
              onChange={(e) =>
                setFormData({ ...formData, cardHolder: e.target.value.toUpperCase() })
              }
              disabled={isLoading}
              className={errors.cardHolder ? "border-red-500" : ""}
            />
            {errors.cardHolder && (
              <p className="text-red-500 text-sm mt-1">{errors.cardHolder}</p>
            )}
          </div>

          {/* Expiry & CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Vencimiento
              </label>
              <Input
                type="text"
                placeholder="MM/YY"
                value={formData.expiryDate}
                onChange={handleExpiryDateChange}
                disabled={isLoading}
                className={errors.expiryDate ? "border-red-500" : ""}
              />
              {errors.expiryDate && (
                <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                CVV
              </label>
              <Input
                type="password"
                placeholder="123"
                value={formData.cvv}
                onChange={handleCVVChange}
                disabled={isLoading}
                className={errors.cvv ? "border-red-500" : ""}
                maxLength={3}
              />
              {errors.cvv && (
                <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
            <p className="mb-2">
              <strong>Nota:</strong> Este es un sistema de pago simulado para demostración.
            </p>
            <p>
              Puedes usar cualquier número de tarjeta de 16 dígitos. Para simular un rechazo, usa: <code className="bg-white px-2 py-1 rounded">4000 0000 0000 0002</code>
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold"
              disabled={isLoading}
            >
              {isLoading ? "Procesando..." : "Pagar"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
