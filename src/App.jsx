import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  AppBar,
  Box,
  Button,
  Chip,
  Container,
  CssBaseline,
  Paper,
  Stack,
  ThemeProvider,
  Toolbar,
  Typography,
} from "@mui/material";

import CompareArrowsRoundedIcon from "@mui/icons-material/CompareArrowsRounded";
import DataObjectRoundedIcon from "@mui/icons-material/DataObjectRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";

import JsonEditor from "./components/JsonEditor.jsx";
import DiffResults from "./components/DiffResults.jsx";
import ThemeToggle from "./components/ThemeToggles.jsx";

import getAppTheme from "./theme.js";
import { compareJson } from "./utils/compare.js";
import { parseJson, prettyJson } from "./utils/json.js";

const initialLeft = `{
  "name": "Acme",
  "version": 1,
  "features": ["users", "reports"],
  "settings": {
    "theme": "light",
    "notifications": true
  }
}`;

const initialRight = `{
  "name": "Acme",
  "version": 2,
  "features": ["users", "analytics"],
  "settings": {
    "theme": "dark",
    "notifications": true
  },
  "active": true
}`;

export default function App() {
  // Theme preference: light, dark, or system
  const [preference, setPreference] = useState(() => {
    return localStorage.getItem("json-compare-theme") || "system";
  });

  // Operating system theme
  const [systemMode, setSystemMode] = useState(() => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  // Resolve active theme
  const mode = preference === "system" ? systemMode : preference;

  // Always create a valid Material UI theme object
  const theme = useMemo(() => getAppTheme(mode), [mode]);

  // JSON editor states
  const [leftText, setLeftText] = useState(initialLeft);
  const [rightText, setRightText] = useState(initialRight);

  const [hasCompared, setHasCompared] = useState(true);
  const [compareError, setCompareError] = useState("");

  // Save theme preference
  useEffect(() => {
    localStorage.setItem("json-compare-theme", preference);
  }, [preference]);

  // Listen for operating system theme changes
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const handleThemeChange = (event) => {
      setSystemMode(event.matches ? "dark" : "light");
    };

    media.addEventListener("change", handleThemeChange);

    return () => {
      media.removeEventListener("change", handleThemeChange);
    };
  }, []);

  // Parse both JSON documents
  const parsed = useMemo(() => {
    let left = null;
    let right = null;
    let leftError = "";
    let rightError = "";

    try {
      left = parseJson(leftText);
    } catch (error) {
      leftError = error.message;
    }

    try {
      right = parseJson(rightText);
    } catch (error) {
      rightError = error.message;
    }

    return {
      left,
      right,
      leftError,
      rightError,
    };
  }, [leftText, rightText]);

  // Compare JSON documents
  const differences = useMemo(() => {
    if (parsed.leftError || parsed.rightError) {
      return [];
    }

    return compareJson(parsed.left, parsed.right);
  }, [parsed]);

  // Compare button
  const handleCompare = () => {
    if (parsed.leftError || parsed.rightError) {
      setCompareError("Fix the JSON syntax errors before comparing.");

      setHasCompared(false);
      return;
    }

    setCompareError("");
    setHasCompared(true);
  };

  // Format JSON
  const format = (text, setter) => {
    try {
      setter(prettyJson(parseJson(text)));
      setCompareError("");
    } catch {
      setCompareError("Cannot format invalid JSON. Check the syntax first.");
    }
  };

  // Upload JSON file
  const loadFile = (setter) => async (file) => {
    try {
      setter(await file.text());
      setCompareError("");
      setHasCompared(false);
    } catch {
      setCompareError(`Could not read ${file.name}.`);
    }
  };

  // Reset editors
  const reset = () => {
    setLeftText("");
    setRightText("");
    setCompareError("");
    setHasCompared(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box
        className="app-shell"
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          color: "text.primary",
          transition: "background-color 0.2s ease, color 0.2s ease",
        }}
      >
        {/* Application Header */}
        <AppBar
          position="static"
          elevation={0}
          color="transparent"
          sx={{
            bgcolor: "background.paper",
            color: "text.primary",
            borderBottom: 1,
            borderColor: "divider",
            transition: "background-color 0.3s ease, color 0.3s ease",
          }}
        >
          <Container maxWidth="xl">
            <Toolbar disableGutters>
              <Stack direction="row" alignItems="center" spacing={1.25}>
                <Box className="brand-icon">
                  <DataObjectRoundedIcon />
                </Box>

                <Box>
                  <Typography fontWeight={800} lineHeight={1.1}>
                    JSON Compare
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    A simple, precise JSON diff tool
                  </Typography>
                </Box>
              </Stack>

              <Box sx={{ flex: 1 }} />

              <Stack direction="row" alignItems="center" spacing={1}>
                <Chip
                  size="small"
                  variant="filled"
                  label="Runs locally in your browser"
                  sx={{
                    display: { xs: "none", sm: "flex" },
                  }}
                />

                {/* Dark Mode Toggle */}
                <ThemeToggle
                  mode={mode}
                  preference={preference}
                  onChange={setPreference}
                />
              </Stack>
            </Toolbar>
          </Container>
        </AppBar>

        {/* Main Content */}
        <Container maxWidth="xl" className="main-container">
          {/* Hero Section */}
          <Box className="hero">
            <Typography
              variant="overline"
              color="primary"
              fontWeight={800}
              letterSpacing="0.12em"
            >
              DEVELOPER TOOL
            </Typography>

            <Typography variant="h4" sx={{ mt: 0.5 }}>
              Compare JSON side by side.
            </Typography>

            <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 650 }}>
              Paste or upload two JSON documents to find added, removed, and
              changed values. Object key order is ignored; array order is
              significant.
            </Typography>
          </Box>

          {/* JSON Editors */}
          <Box className="editor-grid">
            <JsonEditor
              title="Original JSON"
              subtitle="The baseline document"
              side="left"
              value={leftText}
              onChange={(value) => {
                setLeftText(value);
                setHasCompared(false);
              }}
              onFormat={() => format(leftText, setLeftText)}
              onFile={loadFile(setLeftText)}
            />

            <JsonEditor
              title="Modified JSON"
              subtitle="The document to compare against"
              side="right"
              value={rightText}
              onChange={(value) => {
                setRightText(value);
                setHasCompared(false);
              }}
              onFormat={() => format(rightText, setRightText)}
              onFile={loadFile(setRightText)}
            />
          </Box>

          {/* Action Buttons */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{
              xs: "stretch",
              sm: "center",
            }}
            spacing={1.5}
            sx={{ my: 2.5 }}
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<CompareArrowsRoundedIcon />}
              onClick={handleCompare}
            >
              Compare JSON
            </Button>

            <Button
              variant="text"
              color="inherit"
              startIcon={<RestartAltRoundedIcon />}
              onClick={reset}
            >
              Clear editors
            </Button>

            <Box sx={{ flex: 1 }} />

            {!parsed.leftError && !parsed.rightError && (
              <Typography variant="caption" color="text.secondary">
                Both documents are valid JSON
              </Typography>
            )}
          </Stack>

          {/* JSON Validation Errors */}
          {(parsed.leftError || parsed.rightError) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {parsed.leftError && <div>Original JSON: {parsed.leftError}</div>}

              {parsed.rightError && (
                <div>Modified JSON: {parsed.rightError}</div>
              )}
            </Alert>
          )}

          {/* Comparison Error */}
          {compareError && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {compareError}
            </Alert>
          )}

          {/* Comparison Results */}
          {hasCompared && !parsed.leftError && !parsed.rightError && (
            <>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 1.5 }}
              >
                <Typography variant="h6">Comparison result</Typography>

                <Chip
                  size="small"
                  color={differences.length ? "warning" : "success"}
                  label={
                    differences.length
                      ? `${differences.length} differences found`
                      : "Identical"
                  }
                />
              </Stack>

              <DiffResults differences={differences} />
            </>
          )}

          {/* Footer */}
          <Typography
            className="footer-note"
            color="text.secondary"
            sx={{ mt: 4, pb: 3 }}
          >
            Your JSON is processed in this browser and is not uploaded to a
            server.
          </Typography>
        </Container>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            textAlign: "center",
            mt: 3,
            pb: 2,
          }}
        >
          Made with ❤️ by Atul Chourasiya
        </Typography>
      </Box>
    </ThemeProvider>
  );
}
