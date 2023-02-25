
lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
    ]
def calculate_winner(squares):

    if squares:
        for line in lines:
            [a, b, c] = line
            if squares[a] and squares[a] == squares[b] and squares[b] == squares[c]:
                return squares[a]
    return None


initial_list = [None for i in range(9)]

def submit_move(move):
    global initial_list
    counter = initial_list.count(None)
    xIsNext = counter % 2 == 0
    if xIsNext:
        initial_list[move] = "O"
    else :
        initial_list[move] = "X"
    return initial_list

submit_move(1)
submit_move(2)
submit_move(4)
submit_move(3)
submit_move(7)

print(int(3 / 3))


if __name__ == '__main__':

    print(calculate_winner(initial_list))