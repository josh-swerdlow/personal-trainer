import React, { useState } from 'react';
import { ChevronUp } from 'lucide-react';

const BottomBanner = () => {
    const [isVisible, setIsVisible] = useState(true);

    return (
        <div className="fixed bottom-0 left-0 right-0">
            {isVisible ? (
                <div className="bg-blue-500 text-white p-4">
                    <div className="container mx-auto flex items-center justify-between">
                        <div className="flex-1">
                            <p className="font-medium">iPhone Must Remain Unlocked During Workout</p>
                            <p className="text-sm text-blue-100"><span>Settings &gt; Display & Brightness &gt; Auto-Lock &gt; Never</span></p>
                        </div>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="bg-white text-blue-500 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsVisible(true)}
                    className="bg-blue-500 text-white p-2 rounded-t-lg hover:bg-blue-600 transition-colors ml-4"
                >
                    <ChevronUp size={20} />
                </button>
            )}
        </div>
    );
};

export default BottomBanner;