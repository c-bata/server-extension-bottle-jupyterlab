import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from "@mui/material";
import { Dispatch, FC, default as React, SetStateAction, useState } from "react";
import { requestAPI } from '.././handler';
import { DebouncedInputTextField } from "./Debounce";

export const InitDashboard: FC<{ setIsInitialized: Dispatch<SetStateAction<boolean>>, setLoading: Dispatch<SetStateAction<boolean>> }> = ({ setIsInitialized, setLoading }) => {

    const [storageURL, setStorageURL] = useState("")
    const [artifactPath, setArtifactPath] = useState("")
    const [openNewDashboardDialog, setOpenNewDashboardDialog] = useState(true)
    const [isValidURL, setIsValidURL] = useState(false)


    const handleCloseNewDashboardDialog = () => {
        setOpenNewDashboardDialog(false)
    }

    const handleCreateNewDashboard = () => {
        setOpenNewDashboardDialog(false)
        setLoading(true)

        requestAPI<void>(`/api/register_dashboard_app`, {
            body: JSON.stringify({
                storage_url: storageURL,
                artifact_path: artifactPath,
            }),
            method: 'POST',
        }).then(() => {
            return requestAPI<void>(`/api/is_initialized`, {
                body: JSON.stringify({
                    is_initialized: true,
                }),
                method: 'POST',
            }).then(() => {
                setIsInitialized(true)
            })
        }).catch((err) => {
            console.log(err)
        })
    }
    const handleValidateURL = (url: string) => {
        url.startsWith("redis") ? setIsValidURL(true) : setIsValidURL(false)
    }

    return (
        <Box sx={{ display: "flex" }}>
            <Dialog
                open={openNewDashboardDialog}
                onClose={() => {
                    handleCloseNewDashboardDialog()
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreateNewDashboard() }}
                aria-labelledby="initialize-dashboard-dialog-title"
            >
                <DialogTitle id="initialize-dashboard-dialog-title">New Dashboard</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please enter a storage url and an artifact path.
                    </DialogContentText>
                    <DebouncedInputTextField
                        onChange={(s) => {
                            handleValidateURL(s)
                            setStorageURL(s)
                        }}
                        delay={500}
                        textFieldProps={{
                            autoFocus: true,
                            fullWidth: true,
                            label: "Storage URL",
                            type: "text",
                            sx: { margin: "4px 0" }
                        }}
                    />
                    <DebouncedInputTextField
                        onChange={(s) => {
                            setArtifactPath(s)
                        }}
                        delay={500}
                        textFieldProps={{
                            autoFocus: true,
                            fullWidth: true,
                            label: "Artifact path (Optional)",
                            type: "text",
                            sx: { margin: "4px 0" }
                        }}

                    />
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleCloseNewDashboardDialog} color="primary">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreateNewDashboard}
                        color="primary"
                        disabled={!isValidURL}
                    >
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}