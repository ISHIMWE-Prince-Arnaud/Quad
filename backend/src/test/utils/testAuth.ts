export const getAuthHeaders = (userId: string) => ({
  "x-test-user-id": userId,
});

export const DEFAULT_TEST_USER_ID = "test_user_1";
