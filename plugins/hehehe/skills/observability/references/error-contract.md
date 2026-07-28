# Structured Error and Logging Contract

Apply this contract at backend boundaries while adapting names and syntax to the existing language and framework. Prefer one small project-native error type or mapping function over a class hierarchy.

## Stable Error Identity

Give every client-distinguishable failure a stable uppercase `error_code` such as:

```text
COMMON_VALIDATION_FAILED
AUTH_UNAUTHORIZED
AUTH_FORBIDDEN
MAINTENANCE_PLAN_NOT_FOUND
MAINTENANCE_PLAN_DUPLICATED
DB_QUERY_FAILED
EXTERNAL_API_TIMEOUT
INTERNAL_ERROR
```

Use domain or subsystem prefixes and uppercase snake case. Keep the code stable when human wording changes. Reuse an existing code when the meaning and client action are the same; do not create a code for every exception message.

Separate:

- validation failures caused by malformed input
- expected business failures such as not found, duplicate, or forbidden
- dependency failures such as database, timeout, or upstream rejection
- unexpected programming or system failures

## Client Response

Return a predictable, safe shape at the transport boundary:

```json
{
  "error": {
    "code": "MAINTENANCE_PLAN_DUPLICATED",
    "message": "이미 등록된 설비보전계획입니다.",
    "request_id": "req-1234"
  }
}
```

- Use an appropriate HTTP status independently from the application code.
- Make `message` safe and actionable for the user.
- Never return raw exception messages, stack traces, SQL, table names, filesystem paths, credentials, tokens, or internal host details.
- Map unexpected failures to a generic client message and `INTERNAL_ERROR`; preserve the real cause only in the protected server log.
- Keep compatibility with an established response envelope unless changing the public API is explicitly in scope.

## Structured Backend Log

Emit errors as structured fields through the project's existing logger:

```json
{
  "timestamp": "2026-07-28T06:00:00.000Z",
  "level": "error",
  "service_name": "maintenance-api",
  "error_code": "MAINTENANCE_PLAN_CREATE_FAILED",
  "message": "설비보전계획 생성 실패",
  "request_id": "req-1234",
  "operation": "createMaintenancePlan",
  "route": "POST /api/maintenance-plans",
  "duration_ms": 183,
  "cause_type": "UniqueViolation"
}
```

Required for a logged request failure:

- severity level
- stable error code
- short human-readable event message
- operation or boundary that failed
- request or correlation identifier when a request exists

Add route, service name, duration, dependency, retry count, or cause type only when useful. Log the exception object through the logger's supported error field when stack capture is needed; do not interpolate it into an unstructured string.

Do not log passwords, authorization headers, cookies, access or refresh tokens, secret keys, full request bodies, payment data, or unnecessary personal data. Redact or allowlist fields before logging.

## Request Correlation

At the first trusted application edge:

1. Accept an inbound request identifier only when it matches the project's length and character policy; otherwise generate one.
2. Store it in request-scoped context.
3. attach it to backend logs and downstream calls where supported.
4. Return it in a response header and, for error responses, the error envelope.
5. Confirm the browser/API result and backend log share the same value during verification.

Use an opaque identifier. Do not encode user identity or sensitive data in it. Request correlation does not require distributed tracing.

## Error Mapping Boundary

- Let domain or application code express typed or categorized failures without HTTP, framework request objects, or logger dependencies.
- Map those failures to status codes and client responses at a transport-level error handler.
- Log an expected failure once at the level appropriate to its operational value; avoid duplicate logging at every layer.
- Log unexpected failures once with the protected cause and correlation context.
- Preserve original causes when the language supports wrapping, but expose only the safe mapped response.
- Keep transaction rollback and cleanup behavior explicit.

## Verification Matrix

For a changed API path, verify the applicable rows:

| Scenario | Client evidence | Server evidence |
| --- | --- | --- |
| Success | expected status and response | no error-level event |
| Invalid input | stable validation code; no internals | optional low-severity event |
| Expected business failure | stable domain code and safe message | operation and request ID when logged |
| Dependency failure | safe mapped code or internal code | protected cause, dependency, request ID |
| Unexpected failure | generic message and `INTERNAL_ERROR` | original cause, operation, request ID |

Also confirm that logs and test artifacts contain no known secrets or unnecessary personal data.

## Language Guidance

- Node.js/TypeScript: use the established logger and one error middleware or framework exception filter. Avoid scattered `console.error` in application services.
- Go: use the established `log/slog` or logger adapter, wrap errors with `%w`, classify with `errors.Is` or `errors.As`, and map them once at the HTTP boundary.
- Python: use the established `logging` or structured logger configuration and framework-level exception handlers; preserve exception context without returning it.

These are adaptations, not dependency requirements. Do not introduce an ORM, logging framework, or OpenTelemetry SDK only to satisfy this contract.
