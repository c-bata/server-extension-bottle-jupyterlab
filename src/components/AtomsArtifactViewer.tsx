import React, { useEffect } from "react"
import { Stage } from "ngl"
import { Box } from "@mui/material"

interface AtomsArtifactViewerProps {
  artifactId: string
  src: string
  width: string
  height: string
  rotate: boolean
  filetype: string | undefined
}

export const AtomsArtifactViewer: React.FC<AtomsArtifactViewerProps> = (
  props
) => {
  const viewportId = "viewport_" + props.artifactId
  useEffect(() => {
    const stage = new Stage(viewportId, { backgroundColor: "white" })
    const reader = new FileReader()
    reader.onload = function (e) {
      const data = e.target?.result
      if (props.rotate) {
        stage.viewerControls.rotate([0, 1, 0, 0])
        // @ts-ignore
        stage.setSpin([0, 1, 0], 10);
      }
      if (typeof data === "string") {
        stage
          .loadFile(data, { ext: props.filetype, defaultRepresentation: false })
          .then(function (o) {
            // @ts-ignore
            o.addRepresentation("ball+stick")
            // @ts-ignore
            o.addRepresentation("spacefill", { radiusScale: 0.5 }) //TODO: add cylinder
            // @ts-ignore
            o.addRepresentation("unitcell")
            // @ts-ignore
            o.autoView()
          })
      }
    }
    const blob = new Blob([props.src], { type: "text/plain" })
    reader.readAsText(blob)
  }, [])
  return (
    <Box id={viewportId} sx={{ width: props.width, height: props.height }} />
  )
}
