import { Registry, collectDefaultMetrics, Counter } from "prom-client";

declare global {
	// var usage is required for global declaration
	// eslint-disable-next-line no-var
	var metrics:
		| {
				registry: Registry;
		  }
		| undefined;
}

export async function register() {
	if (process.env.NEXT_RUNTIME === "nodejs") {
		const prometheusRegistry = new Registry();
		collectDefaultMetrics({
			register: prometheusRegistry,
		});

		globalThis.metrics = {
			registry: prometheusRegistry,
		};

		// vercel otel for traces
	}
}
