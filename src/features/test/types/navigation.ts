import type { SerializableTestResult } from './testing';

// ==================== TEST STACK NAVIGATION ====================

// Test stack navigation parameters
export type TestStackParamList = Readonly<{
    Test: undefined;
    SubcategoryTest: undefined;
    ConversationTest: undefined;
    TestQuestion: undefined;
    TestResult: {
        readonly testResult: SerializableTestResult;
    } | undefined;
    Progress: undefined;
    Review: undefined;
}>;

