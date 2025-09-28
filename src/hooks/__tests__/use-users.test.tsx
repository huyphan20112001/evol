import { renderHook } from '@testing-library/react-hooks';
import { useUsers } from '../use-users';

test('hello world!', () => {
  const { result } = renderHook(() => useUsers());
  expect(result.current).toBeDefined();
});