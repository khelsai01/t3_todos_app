import React, { useState, useRef } from 'react';

interface File {
  name: string;
  size: number;
  type: string;
}

const Upload = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadMessage, setUploadMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (file) {
      setUploadedFile({
        name: file.name,
        size: file.size,
        type: file.type,
      });
    }
  };

  const handleUploadFile = () => {
    if (uploadedFile) {
      sessionStorage.setItem('uploadedFile', JSON.stringify(uploadedFile));
      setUploadMessage('File uploaded successfully!');
      setUploadedFile(null); 
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; 
      }
    }
  };

  const handleDeleteFile = (index: number) => {
    const updatedFiles = [...uploadedFiles];
    updatedFiles.splice(index, 1);
    setUploadedFiles(updatedFiles);
    sessionStorage.removeItem('uploadedFile'); 
    console.log('Updated files:', updatedFiles); 
  };

  const handleSeeFiles = () => {
    const storedFile: string | null = sessionStorage.getItem('uploadedFile');
    const file: File | null = storedFile ? (JSON.parse(storedFile) as File) : null;
    if (file) {
      setUploadedFiles([file]);
    }
  };

  console.log('Uploaded Files:', uploadedFiles); 

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="mb-4 p-2 border border-gray-300 rounded-md"
      />
      <button
        onClick={handleUploadFile}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Upload File
      </button>
      <button
        onClick={handleSeeFiles}
        className="ml-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
      >
        See Files
      </button>
      {uploadMessage && <p className="mt-4 text-green-600">{uploadMessage}</p>}
      {uploadedFile && uploadedFiles.length === 0 && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <p className="font-bold">Uploaded File: {uploadedFile.name}</p>
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-bold mb-2">Uploaded Files</h3>
          <ul>
            {uploadedFiles.map((file, index) => (
              <li key={index} className="mb-2">
                {file.name}{' '}
                <button
                  onClick={() => handleDeleteFile(index)}
                  className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Upload;