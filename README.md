# Sales Enquiry Agent

An incoming sales message becomes a lead proposal and a follow-up draft. A reviewer checks the extracted fields and approves the write to a local sandbox CRM.

## Run

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --port 8001
```

Open http://127.0.0.1:8001, load the sample enquiry, and approve it. Run it again to see the duplicate check. Swagger UI is available at `/docs`.

Local mode accepts free-form messages with one email and extracts optional `Name:` and `Interest:` lines. Set `OPENAI_API_KEY` to enable model-based extraction through a strict tool schema. The provider receives the enquiry text in that mode. `OPENAI_MODEL` overrides the default model, and `CRM_DB` controls SQLite storage.

## Write boundary

1. The extraction tool proposes three fields. The app checks the proposed email against the single distinct email in the original message. Provider errors and invalid proposals fall back to local extraction.
2. The API checks the normalized email against the sandbox CRM, stores a reviewable draft, and generates a follow-up draft. The draft ID exposes an audit trail through `GET /api/enquiries/{id}`.
3. The approval endpoint checks again inside the write transaction. The CRM enforces a unique email. Identical approval retries return the original result, and changed retries return HTTP 409.

The reviewer can change lead fields before approval. The follow-up is a suggested message. The CRM is SQLite-backed and the demo runs without user accounts, so use synthetic data. A production integration would need reviewer authentication, tenant isolation, retention controls, and an external CRM idempotency contract.

## Checks

Run `python -m unittest -v`. Four integration tests cover lead extraction and follow-up, ambiguous emails, concurrent duplicate protection and approval retries, and validation of untrusted model output. The provider test uses a mocked response. The local test suite makes zero model API calls.
