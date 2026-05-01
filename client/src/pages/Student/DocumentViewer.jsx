import { useState, useEffect } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useAccessibility } from "../../context/AccessibilityContext";
import SignLanguageAvatar from "../../components/SignLanguageAvatar";
import { FaSignLanguage } from "react-icons/fa";

const DocumentViewer = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { speak } = useAccessibility();

  // Sign Language Modal State
  const [signText, setSignText] = useState(null);
  const [isSigning, setIsSigning] = useState(false);
  const [signingDocTitle, setSigningDocTitle] = useState("");

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await api.get("/documents");
        setDocuments(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  const handleSignDocument = async (docUrl, docTitle) => {
    setIsSigning(true);
    setSigningDocTitle(docTitle);
    setSignText(null);
    try {
      const response = await api.get(
        `/documents/extract-text?url=${encodeURIComponent(docUrl)}`,
        { responseType: "text" },
      );
      const text = response.data;
      if (!text || (typeof text === 'string' && text.trim().length === 0)) {
        setSignText("This document appears to contain no readable text. It might be an image-only PDF.");
      } else {
        setSignText(text);
      }
    } catch (e) {
      console.error("Failed to extract content", e);
      setSignText("Failed to read document. The text might be protected or not formatted correctly.");
    }
  };

  const handleReadDocument = async (docUrl) => {
    speak("Processing document text. Please wait...");
    try {
      // Connect to the backend text-extraction API that handles BOTH .txt and .pdf files
      const response = await api.get(
        `/documents/extract-text?url=${encodeURIComponent(docUrl)}`,
        {
          responseType: "text", // Ensure axios returns plain text correctly
        },
      );
      const text = response.data;
      if (!text || (typeof text === 'string' && text.trim().length === 0)) {
        speak("This document appears to contain no readable text. It might be an image-only PDF.");
      } else {
        speak(text);
      }
    } catch (e) {
      console.error("Failed to extract content", e);
      speak(
        "Failed to read document. The text might be protected or not formatted correctly.",
      );
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Assigned Documents
      </h1>

      {loading ? (
        <p>Loading documents...</p>
      ) : documents.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">
            No documents available at the moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div
              key={doc._id}
              className="flex flex-col bg-white dark:bg-gradient-to-br dark:from-[#141b2d] dark:to-[#1e2640] p-6 rounded-2xl shadow-sm hover:shadow-xl dark:shadow-indigo-900/20 transition-all duration-300 border border-gray-200 dark:border-[#2a3454] transform hover:-translate-y-1"
            >
              <div className="flex-1 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-[#f8fafc] line-clamp-2 leading-tight">
                    {doc.title}
                  </h3>
                  <span className="shrink-0 ml-3 px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-[#8b5cf6]/20 dark:text-[#c4b5fd] text-xs font-extrabold rounded-full uppercase tracking-widest border dark:border-[#8b5cf6]/30">
                    {doc.fileUrl?.split(".").pop() || "DOC"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-[#94a3b8] line-clamp-3 leading-relaxed">
                  {doc.description || "No description provided."}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-auto pt-5 border-t border-gray-100 dark:border-[#2a3454]">
                <a
                  href={`http://localhost:5000${doc.fileUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 inline-flex justify-center items-center px-4 py-2.5 bg-blue-600 dark:bg-gradient-to-r dark:from-blue-600 dark:to-cyan-500 text-white rounded-xl hover:opacity-90 shadow-md shadow-blue-500/30 text-sm font-semibold transition-all"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  Open
                </a>

                {/* STRICT RULE: Text-To-Speech functionality Only applies for Visually-Impaired */}
                {user?.accessibilityType === "visually-impaired" && (
                  <button
                    onClick={() => handleReadDocument(doc.fileUrl)}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2.5 bg-purple-600 dark:bg-gradient-to-r dark:from-purple-600 dark:to-[#f43f5e] text-white rounded-xl hover:opacity-90 shadow-md shadow-purple-500/30 text-sm font-semibold transition-all"
                    aria-label={`Read ${doc.title} document aloud`}
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                      />
                    </svg>
                    TTS
                  </button>
                )}

                {user?.accessibilityType === "hearing-impaired" && (
                  <button
                    onClick={() => handleSignDocument(doc.fileUrl, doc.title)}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2.5 bg-indigo-600 dark:bg-gradient-to-r dark:from-indigo-600 dark:to-purple-500 text-white rounded-xl hover:opacity-90 shadow-md shadow-indigo-500/30 text-sm font-semibold transition-all"
                    aria-label={`View sign language for ${doc.title}`}
                  >
                    <FaSignLanguage className="w-4 h-4 mr-2" />
                    Sign Language
                  </button>
                )}
              </div>
              <div className="mt-4 text-xs font-medium text-gray-500 dark:text-gray-500 flex items-center justify-between">
                <span className="truncate flex-1">
                  Uploaded by: {doc.uploadedByName}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sign Language Modal */}
      {isSigning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl bg-white dark:bg-[#1a1d2e] rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-[#0f1117]">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FaSignLanguage className="text-indigo-500" /> Sign Language: {signingDocTitle}
              </h2>
              <button
                onClick={() => setIsSigning(false)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              {signText === null ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mb-4"></div>
                  <p>Extracting text from document...</p>
                </div>
              ) : (
                <div style={{ width: '100%', height: 400, background: '#0d0f18', borderRadius: 12, position: 'relative' }}>
                  <SignLanguageAvatar text={signText} height="100%" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentViewer;
