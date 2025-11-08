'use client';

/**
 * Transaction Receipt Component
 * 
 * Shows a shareable receipt after successful transaction
 */

interface TransactionReceiptProps {
  isOpen: boolean;
  transactionHash?: string;
  amount: string;
  currency: string;
  toAddress: string;
  timestamp: string;
  onClose: () => void;
}

export function TransactionReceipt({
  isOpen,
  transactionHash,
  amount,
  currency,
  toAddress,
  timestamp,
  onClose
}: TransactionReceiptProps) {
  if (!isOpen) return null;

  const getExplorerUrl = (txHash: string) => {
    const network = process.env.NEXT_PUBLIC_ETHEREUM_NETWORK || 'sepolia';
    const baseUrl = network === 'mainnet' 
      ? 'https://etherscan.io' 
      : `https://${network}.etherscan.io`;
    return `${baseUrl}/tx/${txHash}`;
  };

  const handleShare = () => {
    if (transactionHash) {
      const receiptText = `Transaction Receipt\n\nAmount: ${amount} ${currency}\nTo: ${toAddress}\nTransaction Hash: ${transactionHash}\n\nView on Explorer: ${getExplorerUrl(transactionHash)}`;
      
      if (navigator.share) {
        navigator.share({
          title: 'Transaction Receipt',
          text: receiptText
        }).catch(() => {
          // Fallback to copy
          copyToClipboard(receiptText);
        });
      } else {
        copyToClipboard(receiptText);
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Receipt copied to clipboard!');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Success Header */}
          <div className="bg-green-50 p-6 rounded-t-lg border-b border-green-100">
            <div className="text-center">
              <div className="text-5xl mb-3">✅</div>
              <h2 className="text-2xl font-bold text-green-900 mb-1">
                Transaction Successful!
              </h2>
              <p className="text-green-700 text-sm">
                Your transaction has been submitted to the blockchain
              </p>
            </div>
          </div>

          {/* Receipt Details */}
          <div className="p-6 space-y-4">
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                ${amount}
              </div>
              <div className="text-sm text-gray-600">{currency}</div>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-3">
              <div>
                <div className="text-xs text-gray-500 mb-1">To Address</div>
                <div className="text-sm font-mono text-gray-900 break-all">
                  {toAddress}
                </div>
              </div>

              {transactionHash && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Transaction Hash</div>
                  <div className="text-sm font-mono text-gray-900 break-all">
                    {transactionHash}
                  </div>
                </div>
              )}

              <div>
                <div className="text-xs text-gray-500 mb-1">Time</div>
                <div className="text-sm text-gray-900">
                  {new Date(timestamp).toLocaleString()}
                </div>
              </div>
            </div>

            {transactionHash && (
              <a
                href={getExplorerUrl(transactionHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-sm text-blue-600 hover:text-blue-700 mt-4"
              >
                View on Etherscan →
              </a>
            )}
          </div>

          {/* Actions */}
          <div className="p-6 pt-0 space-y-3">
            <button
              onClick={handleShare}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              📤 Share Receipt
            </button>
            <button
              onClick={onClose}
              className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

