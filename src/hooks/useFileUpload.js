import { useState, useCallback } from "react";
import { useData } from "../context/DataContext";
import FileProcessor from "../services/FileProcessor";

export default function useFileUpload() {
	const { setData } = useData();
	const [uploadStatus, setUploadStatus] = useState({
		isUploading: false,
		progress: 0,
		error: null
	});

	const fileProcessor = new FileProcessor();

	const uploadFile = useCallback(
		async file => {
			if (!file) return;

			setUploadStatus({
				isUploading: true,
				progress: 0,
				error: null
			});

			try {
				// Simulate progress with a fixed delay increment instead of continuous interval
				for (let progress = 10; progress <= 90; progress += 10) {
					setUploadStatus(prev => ({
						...prev,
						progress
					}));
					// Small fixed delay
					await new Promise(resolve => setTimeout(resolve, 100));
				}

				// Process the file in a single synchronous operation
				const processedData = await fileProcessor.processFile(file);

				// Complete progress
				setUploadStatus({
					isUploading: false,
					progress: 100,
					error: null
				});

				// Set the processed data in context - using a timeout to make sure UI updates first
				setTimeout(() => {
					setData(processedData);
				}, 100);

				return processedData;
			} catch (error) {
				setUploadStatus({
					isUploading: false,
					progress: 0,
					error: error.message || "An error occurred during file upload"
				});
				throw error;
			}
		},
		[fileProcessor, setData]
	);

	const resetUpload = useCallback(() => {
		setUploadStatus({
			isUploading: false,
			progress: 0,
			error: null
		});
	}, []);

	return {
		uploadFile,
		uploadStatus,
		resetUpload
	};
}
