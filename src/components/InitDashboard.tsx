import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    useTheme
} from "@mui/material";
import { Dispatch, FC, default as React, ReactNode, SetStateAction, useState } from "react";
import { requestAPI } from '.././handler';
import { DebouncedInputTextField } from "./Debounce";
const initializeDashboardAPI = (
    storageURL: string, artifactPath: string
): Promise<void> => {
    return requestAPI<void>(`/api/register_dashboard_app`, {
        body: JSON.stringify({
            storage_url: storageURL,
            artifact_path: artifactPath,
        }),
        method: 'POST',
    }).then(() => {
        return
    })
}

const initializeDashboard = (storageURL: string, artifactPath: string, setIsInitialized: Dispatch<SetStateAction<boolean>>) => {

    initializeDashboardAPI(storageURL, artifactPath)
        .then(() => {
            setIsInitialized(true)
            return
        })
        .catch((err) => {
            console.log(err)
        })
}


export const useCreateDashboardDialog = (setIsInitialized: Dispatch<SetStateAction<boolean>>): [() => void, () => ReactNode] => {

    const [storageURL, setstorageURL] = useState("")
    const [artifactPath, setartifactPath] = useState("")
    const [openNewDashboardDialog, setOpenNewDashboardDialog] = useState(false)

    const handleCloseNewDashboardDialog = () => {
        setOpenNewDashboardDialog(false)
    }

    const handleCreateNewDashboard = () => {
        initializeDashboard(storageURL, artifactPath, setIsInitialized)
        setOpenNewDashboardDialog(false)
    }

    const openDialog = () => {
        setOpenNewDashboardDialog(true)
    }

    const renderCreateNewDashboardDialog = () => {
        return (
            <Dialog
                open={openNewDashboardDialog}
                onClose={() => {
                    handleCloseNewDashboardDialog()
                }}
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
        )
    }
    return [openDialog, renderCreateNewDashboardDialog]
}


export const InitDashboard: FC<{ setIsInitialized: Dispatch<SetStateAction<boolean>> }> = ({ setIsInitialized }) => {
    const theme = useTheme()
    const [openCreateDashboardDialog, renderCreateDashboardDialog] =
        useCreateDashboardDialog(setIsInitialized)
    return (
        <Box sx={{ display: "flex" }}>
            <h1>Configure Storage and Artifact</h1>
            <Button
                variant="outlined"
                startIcon={<PlayCircleOutlineIcon />}
                onClick={() => {
                    openCreateDashboardDialog()
                }}
                sx={{ marginRight: theme.spacing(2), minWidth: "120px" }}
            >
                Start
            </Button>
            {renderCreateDashboardDialog()}
        </Box>
    )
}