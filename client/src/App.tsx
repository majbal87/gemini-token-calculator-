import ConfigurationPanel from './components/ConfigurationPanel';
import FileUploader from './components/FileUploader';
import TokenBreakdown from './components/TokenBreakdown';
import { useTokenCalculator } from './hooks/useTokenCalculator';
import { Calculator } from 'lucide-react';

function App() {
  const {
    modelVersion,
    setModelVersion,
    defaultResolutionTier,
    setDefaultResolutionTier,
    videoFPS,
    setVideoFPS,
    files,
    addFiles,
    removeFile,
    tokenCounts
  } = useTokenCalculator();

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans text-gray-900">
      {/* Sidebar */}
      <ConfigurationPanel
        modelVersion={modelVersion}
        setModelVersion={setModelVersion}
        defaultResolutionTier={defaultResolutionTier}
        setDefaultResolutionTier={setDefaultResolutionTier}
        videoFPS={videoFPS}
        setVideoFPS={setVideoFPS}
      />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Header */}
          <header className="flex items-center gap-4 pb-6 border-b border-gray-200">
            <div className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
              <Calculator className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gemini Token Calculator</h1>
              <p className="text-gray-500 mt-1">
                Estimate costs for Gemini 2.5 & 3.0 multimodal inputs.
              </p>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Upload */}
            <div className="lg:col-span-2 space-y-6">
              <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Input Data</h2>
                <FileUploader 
                  onFilesSelected={addFiles} 
                  uploadedFiles={files}
                  onRemoveFile={removeFile}
                />
              </section>
            </div>

            {/* Right Column: Results */}
            <div className="lg:col-span-1">
               <div className="sticky top-8">
                  <TokenBreakdown counts={tokenCounts} />
                  
                  {/* Cost Estimate Card */}
                  <div className="mt-6 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                     <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Estimated Cost (Input)</h3>
                     <p className="text-xs text-gray-400 mb-4">Based on standard pricing (approx.)</p>
                     <div className="text-2xl font-bold text-gray-900">
                        ${(tokenCounts.total * (modelVersion === 'gemini-3.0' ? 0.00000125 : 0.000000075)).toFixed(6)}
                     </div>
                     <p className="text-xs text-gray-400 mt-1">* Varies by SKU (Flash/Pro)</p>
                  </div>
               </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;
