interface PeakAlertModalProps {
  message: string;
  onClose: () => void;
}

export default function PeakAlertModal({ message, onClose }: PeakAlertModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-center justify-center">
      <div className="bg-[#181818] border border-[#2a2a2a] text-white px-6 py-5 rounded-2xl shadow-2xl w-[90%] max-w-md">
        
        <p className="text-sm mb-5 text-center">{message}</p>

        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
