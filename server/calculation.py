
# roles = [
#     [0, 1, 2],
#     [3, 4, 5],
#     [6, 7, 8],
#     [0, 3, 6],
#     [1, 4, 7],
#     [2, 5, 8],
#     [0, 4, 8],
#     [2, 4, 6],
#     ]

def calculate_winner(squares, roles):

    if squares:
        for line in roles:
            x_indexes = [index for index in line if squares[index] == 'X']
            o_indexes = [index for index in line if squares[index] == 'O']
            if x_indexes == line:
                return 'X'
            elif o_indexes == line:
                return 'O'
        nulls = count_null(squares)
        if not nulls:
            return 'tie'
    return None


initial_squares = [None for i in range(9)]

def player_turn(squares):
    counter = count_null(squares)
    return "O" if counter % 2 == 0 else "X"



def count_null(squares):
    return squares.count(None)






if __name__ == '__main__':

    print(calculate_winner(initial_squares))