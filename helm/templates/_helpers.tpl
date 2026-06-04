{{- define "app.fullname" -}}
{{- if .Values.fullnameOverride }}{{ .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}{{- else }}{{ .Release.Name | trunc 63 | trimSuffix "-" }}{{- end }}
{{- end }}

{{- define "app.selectorLabels" -}}
app: {{ include "app.fullname" . }}
{{- end }}

{{- define "app.labels" -}}
app: {{ include "app.fullname" . }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}
