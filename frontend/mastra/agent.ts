
import { Agent } from "@mastra/core";
import { z } from "zod";
import puppeteer from "puppeteer";

// Tool: Mobile Thumb Rule Audit
const mobileThumbAudit = {
    name: "mobileThumbAudit",
    description: "Audits a URL to ensure all interactive elements meet the 44x44px minimum size rule.",
    schema: z.object({
        url: z.string().url().describe("The local URL to audit (e.g., http://localhost:3000/component)"),
    }),
    function: async ({ url }: { url: string }) => {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.setViewport({ width: 375, height: 812 }); // iPhone X/Mobile Viewport
        await page.goto(url, { waitUntil: "networkidle0" });

        // Evaluate elements
        const violations = await page.evaluate(() => {
            const interactives = document.querySelectorAll("button, a, input, [role='button']");
            const badElements: any[] = [];
            interactives.forEach((el) => {
                const rect = el.getBoundingClientRect();
                if (rect.width < 44 || rect.height < 44) {
                    badElements.push({
                        tag: el.tagName,
                        id: el.id,
                        class: el.className,
                        width: rect.width,
                        height: rect.height,
                    });
                }
            });
            return badElements;
        });

        await browser.close();

        if (violations.length > 0) {
            return { success: false, violations };
        }
        return { success: true, message: "All interactive elements meet the Mobile Thumb Rule." };
    },
};

// Tool: JSON Schema Guard
const jsonSchemaGuard = {
    name: "jsonSchemaGuard",
    description: "Validates a JSON object against a specified Zod schema name.",
    schema: z.object({
        json: z.record(z.any()),
        schemaName: z.enum(["user", "website"]).describe("The name of the schema to validate against"),
    }),
    function: async ({ json, schemaName }: { json: any; schemaName: string }) => {
        // Mock schema registry for demonstration
        // In a real scenario, import actual Zod schemas from project
        const schemas: Record<string, z.ZodTypeWithArity<any>> = {
            user: z.object({ email: z.string().email(), isPaid: z.boolean() }),
            website: z.object({ templateId: z.string(), businessName: z.string() }),
        };

        const schema = schemas[schemaName];
        if (!schema) return { success: false, error: "Schema not found" };

        const result = schema.safeParse(json);
        if (!result.success) {
            return { success: false, error: result.error.errors };
        }
        return { success: true, message: "Validation passed." };
    },
};

// Agent Definition
export const uiReviewerAgent = new Agent({
    name: "UI Reviewer",
    instructions: "You are an automated QA agent. Your job is to audit UI components for mobile accessibility and validate data consistency. Always report specific violations.",
    model: {
        provider: "GROQ", // Placeholder, or use a supported provider
        name: "llama-3.1-70b-versatile",
        apiKey: process.env.GROQ_API_KEY,
    },
    tools: {
        mobileThumbAudit,
        jsonSchemaGuard,
    },
});
