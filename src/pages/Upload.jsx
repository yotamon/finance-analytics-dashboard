import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, AlertCircle } from "lucide-react";
import useFileUpload from "../hooks/useFileUpload";
import Button from "../components/ui/Button";
import Container from "../components/layout/Container";
import { useData } from "../context/DataContext";
import LoadingProgressBar from "../components/ui/LoadingProgressBar";

function UploadPage() {
	const navigate = useNavigate();
	const { uploadFile, uploadStatus, resetUpload } = useFileUpload();
	const { loadingState, loadingProgress } = useData();

	const onDrop = useCallback(
		async acceptedFiles => {
			if (acceptedFiles && acceptedFiles.length > 0) {
				try {
					await uploadFile(acceptedFiles[0]);
					navigate("/dashboard");
				} catch (error) {
					/* eslint-disable-next-line no-console */
console.error("Upload error:", error);
				}
			}
		},
		[uploadFile, navigate]
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			"text/csv": [".csv"],
			"application/vnd.ms-excel": [".xls"],
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"]
		},
		maxFiles: 1
	});

	return (
		<Container>
			<div className="max-w-3xl mx-auto py-12 bg-white bg-opacity-90 rounded-lg shadow-sm px-6">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Dashboard</h1>
					<p className="text-gray-600">Upload your financial data to generate beautiful visualizations</p>
				</div>

				<div
					{...getRootProps()}
					className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
						isDragActive ? "border-primary-500 bg-primary-50" : "border-gray-300 hover:border-primary-400 bg-white"
					}`}
					style={{ minHeight: "200px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
					<input {...getInputProps()} />

					{uploadStatus.isUploading ? (
						<div className="py-4">
							<h3 className="text-lg font-medium text-gray-800 mb-3">Processing File...</h3>
							<LoadingProgressBar loadingState={loadingState} progress={uploadStatus.progress || loadingProgress} message="Uploading and processing file..." autoHide={false} />
						</div>
					) : uploadStatus.error ? (
						<div className="py-4 text-red-500">
							<AlertCircle size={48} className="mx-auto mb-4" />
							<h3 className="text-lg font-medium mb-1">Upload Error</h3>
							<p className="mb-4">{uploadStatus.error}</p>
							<Button onClick={resetUpload} variant="outline">
								Try Again
							</Button>
						</div>
					) : (
						<div>
							<Upload size={48} className="mx-auto mb-4 text-primary-500" />
							<h3 className="text-lg font-medium mb-1 text-gray-800">{isDragActive ? "Drop the file here" : "Upload your financial data"}</h3>
							<p className="text-sm text-gray-500 mb-4">Drag and drop your CSV or Excel file, or click to browse</p>
							<div className="flex justify-center gap-3 text-sm text-gray-500">
								<span className="flex items-center">
									<FileText size={16} className="mr-1 text-primary-600" />
									CSV
								</span>
								<span className="flex items-center">
									<FileText size={16} className="mr-1 text-primary-600" />
									Excel
								</span>
							</div>
						</div>
					)}
				</div>

				<div className="mt-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
					<h3 className="font-medium mb-2 text-gray-800">Need sample data?</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Button variant="outline" className="justify-start bg-white" onClick={() => window.open("/sample-data/projects.csv")}>
							<FileText size={16} className="mr-2 text-primary-500" />
							Download Project Portfolio Sample
						</Button>
						<Button variant="outline" className="justify-start bg-white" onClick={() => window.open("/sample-data/financials.csv")}>
							<FileText size={16} className="mr-2 text-primary-500" />
							Download Financial Projections Sample
						</Button>
					</div>
				</div>
			</div>
		</Container>
	);
}

export default UploadPage;
