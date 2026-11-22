
import React, { useRef, useState } from "react";

import {
  Box,
  Button,
  Paper,
  Typography,
  Alert,
  Stack,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import {
  AutoFixHigh,
  FormatAlignLeft,
  UploadFile,
  ContentPaste,
  DeleteOutline,
  Download,
  Compress,
} from "@mui/icons-material";

import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { oneDark } from "@codemirror/theme-one-dark";
import { linter } from "@codemirror/lint";

import {
  detectJsonFormat,
  convertFormat,
  minifyJson,
} from "../utils/json.js";

import JSON5 from "json5";

// Real-time JSON / JSON5 validation
const jsonValidator = (view) => {
  const text = view.state.doc.toString();

  if (!text.trim()) return [];

  try {
    JSON5.parse(text);
    return [];
  } catch (error) {
    const message = error.message;

    const match = message.match(/position\s+(\d+)/i);
    let position = 0;

    if (match) {
      position = Math.min(Number(match[1]), text.length);
    } else {
      const lineMatch = message.match(/line\s+(\d+)/i);

      if (lineMatch) {
        const lineNumber = Number(lineMatch[1]);

        position = view.state.doc.line(
          Math.min(lineNumber, view.state.doc.lines),
        ).from;
      }
    }

    return [
      {
        from: position,
        to: Math.min(position + 1, view.state.doc.length),
        severity: "error",
        message,
      },
    ];
  }
};

export default function JsonEditor({
  title = "JSON Input",
  value = "",
  onChange,
  error,
  onError,
  placeholder = "Paste your JSON or JavaScript object here...",
  minHeight = 350,
}) {
  const fileInputRef = useRef(null);

  const [localError, setLocalError] = useState("");
  const [downloadAnchor, setDownloadAnchor] = useState(null);

  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const currentFormat = detectJsonFormat(value);

  const isValidInput =
    currentFormat !== "INVALID" && currentFormat !== "empty";

  const clearErrors = () => {
    setLocalError("");
    onError?.("");
  };

  const showError = (message) => {
    setLocalError(message);
    onError?.(message);
  };

  // Editor change
  const handleChange = (newValue) => {
    onChange?.(newValue);
    clearErrors();
  };

  // Convert JSON <-> OBJ
  const handleConvert = () => {
    try {
      if (!isValidInput) {
        throw new Error("Please enter valid JSON or OBJ syntax.");
      }

      const targetFormat =
        currentFormat === "JSON" ? "OBJ" : "JSON";

      const converted = convertFormat(value, targetFormat);

      onChange?.(converted);
      clearErrors();
    } catch (err) {
      showError(err.message);
    }
  };

  // Format JSON or OBJ
  const handleFormatJSON = () => {
    try {
      if (!isValidInput) {
        throw new Error("Please enter valid JSON or OBJ syntax.");
      }

      const parsed = JSON5.parse(value);

      const formatted =
        currentFormat === "JSON"
          ? JSON.stringify(parsed, null, 2)
          : JSON5.stringify(parsed, null, 2);

      onChange?.(formatted);
      clearErrors();
    } catch (err) {
      showError(err.message);
    }
  };

  // Minify JSON or OBJ while preserving format
  const handleMinify = () => {
    try {
      if (!isValidInput) {
        throw new Error("Please enter valid JSON or OBJ syntax.");
      }

      const minified = minifyJson(value);

      onChange?.(minified);
      clearErrors();
    } catch (err) {
      showError(err.message);
    }
  };

  // Upload file
  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      onChange?.(String(e.target.result || ""));
      clearErrors();
    };

    reader.onerror = () => {
      showError("Unable to read the selected file.");
    };

    reader.readAsText(file);
    event.target.value = "";
  };

  // Paste clipboard
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();

      onChange?.(text);
      clearErrors();
    } catch {
      showError("Clipboard access failed. Please paste using Ctrl+V.");
    }
  };

  // Clear editor
  const handleClear = () => {
    onChange?.("");
    clearErrors();
  };

  // Download file
  const handleDownload = (extension) => {
    if (!value.trim()) return;

    const blob = new Blob([value], {
      type:
        extension === "json"
          ? "application/json"
          : "text/plain",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const filename = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    link.href = url;
    link.download = `${filename || "json-file"}.${extension}`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
    setDownloadAnchor(null);
  };

  const displayedError = localError || error;

  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        bgcolor: "background.paper",
        color: "text.primary",
        border: 1,
        borderColor: "divider",
      }}
    >
      {/* Editor Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={1.5}
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            Detected format: {currentFormat}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {/* JSON <-> OBJ */}
          <Tooltip
            title={
              currentFormat === "JSON"
                ? "Convert JSON to OBJ"
                : "Convert OBJ to JSON"
            }
          >
            <span>
              <Button
                size="small"
                variant="outlined"
                startIcon={<AutoFixHigh />}
                onClick={handleConvert}
                disabled={!isValidInput}
              >
                {currentFormat === "JSON"
                  ? "JSON → OBJ"
                  : "OBJ → JSON"}
              </Button>
            </span>
          </Tooltip>

          {/* Format */}
          <Tooltip title="Format JSON or OBJ">
            <span>
              <Button
                size="small"
                variant="outlined"
                startIcon={<FormatAlignLeft />}
                onClick={handleFormatJSON}
                disabled={!isValidInput}
              >
                Format
              </Button>
            </span>
          </Tooltip>

          {/* Minify */}
          <Tooltip title="Minify JSON or OBJ">
            <span>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Compress />}
                onClick={handleMinify}
                disabled={!isValidInput}
              >
                Minify
              </Button>
            </span>
          </Tooltip>

          {/* Download */}
          <Tooltip title="Download editor content">
            <span>
              <IconButton
                size="small"
                onClick={(event) =>
                  setDownloadAnchor(event.currentTarget)
                }
                disabled={!value.trim()}
                aria-label="Download file"
              >
                <Download />
              </IconButton>
            </span>
          </Tooltip>

          <Menu
            anchorEl={downloadAnchor}
            open={Boolean(downloadAnchor)}
            onClose={() => setDownloadAnchor(null)}
          >
            <MenuItem onClick={() => handleDownload("json")}>
              Download as JSON (.json)
            </MenuItem>

            <MenuItem onClick={() => handleDownload("txt")}>
              Download as Text (.txt)
            </MenuItem>
          </Menu>

          {/* Paste */}
          <Tooltip title="Paste from clipboard">
            <IconButton
              size="small"
              onClick={handlePaste}
              aria-label="Paste from clipboard"
            >
              <ContentPaste />
            </IconButton>
          </Tooltip>

          {/* Upload */}
          <Tooltip title="Upload file">
            <IconButton
              size="small"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload file"
            >
              <UploadFile />
            </IconButton>
          </Tooltip>

          {/* Clear */}
          <Tooltip title="Clear editor">
            <IconButton
              size="small"
              color="error"
              onClick={handleClear}
              aria-label="Clear editor"
            >
              <DeleteOutline />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.txt,.js"
        hidden
        onChange={handleFileUpload}
      />

      {/* CodeMirror Editor */}
      <Box
        sx={{
          flex: 1,
          minHeight,
          overflow: "hidden",
          border: 1,
          borderColor: "divider",
          borderRadius: 1,
          bgcolor: "background.default",

          "& .cm-editor": {
            minHeight,
            height: "100%",
            fontSize: "13px",
            fontFamily: "monospace",
          },

          "& .cm-scroller": {
            overflow: "auto",
            fontFamily: "monospace",
          },

          "& .cm-gutters": {
            borderRight: 1,
            borderColor: "divider",
          },

          "& .cm-activeLine": {
            backgroundColor: isDark
              ? "rgba(255,255,255,0.06)"
              : "rgba(0,0,0,0.04)",
          },

          "& .cm-activeLineGutter": {
            backgroundColor: "action.selected",
          },
        }}
      >
        <CodeMirror
          value={value}
          height={`${minHeight}px`}
          placeholder={placeholder}
          extensions={[
            json(),
            linter(jsonValidator, {
              delay: 300,
            }),
          ]}
          theme={isDark ? oneDark : "light"}
          onChange={handleChange}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            highlightActiveLine: true,
            highlightActiveLineGutter: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            tabSize: 2,
            indentOnInput: true,
            lint: true,
          }}
        />
      </Box>

      {/* Error Message */}
      {displayedError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {displayedError}
        </Alert>
      )}

      {/* Footer */}
      <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {value.length.toLocaleString()} characters
        </Typography>

        <Typography variant="caption" color="text.secondary">
          JSON / JSON5
        </Typography>
      </Stack>
    </Paper>
  );
}
