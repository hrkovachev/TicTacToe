// Javascript program to find maximum score that
// maximizing player can get.

// Returns the optimal value a maximizer can obtain.
// depth is current depth in game tree.
// nodeIndex is index of current node in scores[].
// isMax is true if current move is of maximizer, else false
// scores[] stores leaves of Game tree.
// h is maximum height of Game tree
function minimax(depth, nodeIndex, isMax, scores, h) {
    // Terminating condition. i.e leaf node is reached
    if (depth == h) return scores[nodeIndex];

    // If current move is maximizer, find the maximum attainable
    // value
    if (isMax)
        return Math.max(
            minimax(depth + 1, nodeIndex * 2, false, scores, h),
            minimax(depth + 1, nodeIndex * 2 + 1, false, scores, h)
        );
    // Else (If current move is Minimizer), find the minimum
    // attainable value
    else
        return Math.min(
            minimax(depth + 1, nodeIndex * 2, true, scores, h),
            minimax(depth + 1, nodeIndex * 2 + 1, true, scores, h)
        );
}

// A utility function to find Log n in base 2
function log2(n) {
    return n == 1 ? 0 : 1 + log2(n / 2);
}

// Driver Code

// The number of elements in scores must be
// a power of 2.
let scores = [3, 5, 2, 9];
let n = scores.length;
let h = log2(n);
let res = minimax(0, 0, true, scores, h);
console.log("The optimal value is : " + res);
