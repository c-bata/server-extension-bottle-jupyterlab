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

    const [storageURL, setstorageURL] = useState("")
    const [artifactPath, setartifactPath] = useState("")
    const [openNewDashboardDialog, setOpenNewDashboardDialog] = useState(true)

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
                setLoading(false)
                setIsInitialized(true)
            })
        }).catch((err) => {
            console.log(err)
        })
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
                        Please enter the study name and directions here.
                    </DialogContentText>
                    <DebouncedInputTextField
                        onChange={(s) => {
                            setstorageURL(s)
                        }}
                        delay={500}
                        textFieldProps={{
                            autoFocus: true,
                            fullWidth: true,
                            label: "Storage URL",
                            type: "text",
                        }}
                    />
                    <DebouncedInputTextField
                        onChange={(s) => {
                            setartifactPath(s)
                        }}
                        delay={500}
                        textFieldProps={{
                            autoFocus: true,
                            fullWidth: true,
                            label: "Artifact path",
                            type: "text",
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
                    >
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}