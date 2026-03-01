import useSWR from "swr";

export function useComments(postId: number, sort = "best") {
  return useSWR(`/api/comments?postId=${postId}&sort=${sort}`);
}
