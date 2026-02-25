import { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import type { CreateContractData } from "../../types";
import { api } from "../../services/api";

export function FundContractForm({
  contractDraft,
  onSuccess,
  onCancel,
}: {
  contractDraft: CreateContractData;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    try {
      // Call backend to create PaymentIntent for this contract draft
      const res = await api.fundDraft(contractDraft);

      const { paymentIntent } = res;
      if (!paymentIntent)
        throw new Error(res.error || "Failed to create payment intent");

      // Confirm payment with card details
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) return;

      const { error: stripeError, paymentIntent: pi } =
        await stripe.confirmCardPayment(paymentIntent.client_secret, {
          payment_method: { card: cardElement },
        });

      if (stripeError) {
        setMessage(stripeError.message ?? "Payment failed");
      } else if (pi?.status === "succeeded") {
        setMessage("✅ Contract funded successfully!");
        onSuccess();
      }
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleFund}
      className="space-y-4 p-4 bg-[var(--background-600)] rounded-lg border border-[var(--border-900)]"
    >
      <CardElement className="p-3 border border-[var(--border-900)] rounded bg-[var(--background-700)]" />
      <div className="flex space-x-2">
        <button
          type="submit"
          disabled={!stripe || loading}
          className="w-full py-2 bg-[var(--primary-500)] text-white rounded-lg hover:bg-[var(--primary-700)] disabled:opacity-50"
        >
          {loading ? "Processing..." : "Fund Contract"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="w-full py-2 bg-[var(--background-700)] text-[var(--text-200)] border border-[var(--border-900)] rounded-lg hover:bg-[var(--background-800)]"
        >
          Cancel
        </button>
      </div>
      {message && <p className="text-sm text-[var(--text-200)]">{message}</p>}
    </form>
  );
}
