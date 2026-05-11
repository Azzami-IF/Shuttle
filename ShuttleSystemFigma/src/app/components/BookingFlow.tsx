import { useState } from 'react';
import SeatSelection from './SeatSelection';
import Payment from './Payment';
import BookingSuccess from './BookingSuccess';

interface BookingFlowProps {
  onBack: () => void;
}

export default function BookingFlow({ onBack }: BookingFlowProps) {
  const [step, setStep] = useState<'seat' | 'payment' | 'success'>('seat');
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const handleSeatConfirm = (seats: string[], price: number) => {
    setSelectedSeats(seats);
    setTotalPrice(price);
    setStep('payment');
  };

  const handlePaymentSuccess = () => {
    setStep('success');
  };

  if (step === 'seat') {
    return <SeatSelection onBack={onBack} onConfirm={handleSeatConfirm} />;
  }

  if (step === 'payment') {
    return (
      <Payment
        onBack={() => setStep('seat')}
        selectedSeats={selectedSeats}
        totalPrice={totalPrice}
        onPaymentSuccess={handlePaymentSuccess}
      />
    );
  }

  return <BookingSuccess onBack={onBack} bookingId="AMB2026051001" />;
}
