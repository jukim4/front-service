{{/*
Generate a name for the application
*/}}
{{- define "front-service.name" -}}
front-service
{{- end }}

{{/*
Generate the full name including release name
*/}}
{{- define "front-service.fullname" -}}
{{ .Release.Name }}-front-service
{{- end }}
