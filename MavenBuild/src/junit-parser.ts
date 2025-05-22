import { parseStringPromise } from 'xml2js';

export async function parseJUnitXML(xml: string): Promise<{ tests: number; failures: number }> {
    const result = await parseStringPromise(xml);
    const testsuite = result.testsuite || result.testsuites.testsuite[0];
    return {
        tests: parseInt(testsuite.$.tests, 10),
        failures: parseInt(testsuite.$.failures, 10)
    };
}
