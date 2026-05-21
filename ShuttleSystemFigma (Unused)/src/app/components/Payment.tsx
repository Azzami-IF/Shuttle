import { ArrowLeft, CreditCard, Wallet, Building2, Check, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface PaymentProps {
  onBack: () => void;
  selectedSeats: string[];
  totalPrice: number;
  onPaymentSuccess?: () => void;
}

export default function Payment({ onBack, selectedSeats, totalPrice, onPaymentSuccess }: PaymentProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const paymentMethods = [
    {
      id: 'gopay',
      name: 'GoPay',
      icon: Wallet,
      type: 'E-Wallet',
      color: 'text-blue-600 bg-blue-100'
    },
    {
      id: 'ovo',
      name: 'OVO',
      icon: Wallet,
      type: 'E-Wallet',
      color: 'text-purple-600 bg-purple-100'
    },
    {
      id: 'dana',
      name: 'DANA',
      icon: Wallet,
      type: 'E-Wallet',
      color: 'text-cyan-600 bg-cyan-100'
    },
    {
      id: 'bca',
      name: 'BCA Virtual Account',
      icon: Building2,
      type: 'Virtual Account',
      color: 'text-blue-600 bg-blue-100'
    },
    {
      id: 'mandiri',
      name: 'Mandiri Virtual Account',
      icon: Building2,
      type: 'Virtual Account',
      color: 'text-yellow-600 bg-yellow-100'
    },
    {
      id: 'bni',
      name: 'BNI Virtual Account',
      icon: Building2,
      type: 'Virtual Account',
      color: 'text-orange-600 bg-orange-100'
    },
    {
      id: 'card',
      name: 'Kartu Kredit/Debit',
      icon: CreditCard,
      type: 'Card',
      color: 'text-green-600 bg-green-100'
    },
  ];

  const adminFee = 2500;
  const finalTotal = totalPrice + adminFee;

  return (
    <div className="size-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#9dc847] to-[#7fb52a] px-6 py-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-white text-xl font-semibold">Pembayaran</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6 overflow-y-auto pb-32">
        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <h3 className="font-semibold text-gray-800 mb-4">Ringkasan Pesanan</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Rute</span>
              <span className="font-medium text-gray-800">Jakarta - Bandung</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tanggal & Waktu</span>
              <span className="font-medium text-gray-800">20 Mei 2026, 08:00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Kursi Dipilih</span>
              <span className="font-medium text-gray-800">{selectedSeats.join(', ')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Jumlah Penumpang</span>
              <span className="font-medium text-gray-800">{selectedSeats.length} orang</span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <h3 className="font-semibold text-gray-800 mb-4">Metode Pembayaran</h3>
          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`w-full p-4 border rounded-lg transition-all text-left ${
                  selectedMethod === method.id
                    ? 'border-[#9dc847] bg-[#9dc847]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${method.color}`}>
                      <method.icon size={24} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{method.name}</p>
                      <p className="text-xs text-gray-500">{method.type}</p>
                    </div>
                  </div>
                  {selectedMethod === method.id && (
                    <div className="w-6 h-6 rounded-full bg-[#9dc847] flex items-center justify-center">
                      <Check size={16} className="text-white" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Price Details */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <h3 className="font-semibold text-gray-800 mb-4">Rincian Harga</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Harga Tiket ({selectedSeats.length}x)</span>
              <span className="text-gray-800">Rp {totalPrice.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Biaya Admin</span>
              <span className="text-gray-800">Rp {adminFee.toLocaleString('id-ID')}</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between">
              <span className="font-semibold text-gray-800">Total Pembayaran</span>
              <span className="font-bold text-[#7fb52a] text-lg">
                Rp {finalTotal.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-1 rounded text-[#9dc847] focus:ring-[#9dc847]"
            />
            <span className="text-sm text-gray-600">
              Saya setuju dengan{' '}
              <a href="#" className="text-[#7fb52a] hover:underline">
                syarat dan ketentuan
              </a>{' '}
              yang berlaku
            </span>
          </label>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 shadow-lg">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-gray-600">Total Pembayaran</p>
              <p className="text-xl font-bold text-gray-800">
                Rp {finalTotal.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
          <button
            onClick={() => onPaymentSuccess?.()}
            disabled={!selectedMethod || !agreeTerms}
            className="w-full py-3 bg-gradient-to-r from-[#9dc847] to-[#7fb52a] text-white rounded-lg font-semibold hover:from-[#8ab839] hover:to-[#6fa321] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Bayar Sekarang
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
