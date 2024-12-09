from concurrent.futures import ProcessPoolExecutor
from colorama import Fore, Style, init
from multiprocessing import Manager

# Initialize colorama
init(autoreset=True)

def read_input():
    with open('resources/real', 'r') as file:
        return file.readline().strip()


def safe_print(queue, message):
    """
Function to safely print messages via a queue.
    """
    queue.put(message)


def get_formatted_disk(line, queue):
    safe_print(queue, Fore.YELLOW + "[DEBUG] Formatting disk from input line...")
    blocks = []
    empty, inc_id = False, 0

    for idx, ch in enumerate(line):
        safe_print(queue, Fore.YELLOW + f"  [DEBUG] Processing character '{ch}' at index {idx}")
        if not empty:
            block = [str(inc_id)] * int(ch)
            safe_print(queue, Fore.LIGHTMAGENTA_EX + f"    Adding block: {block}")
            blocks.append(block)
            inc_id += 1
        else:
            block = ['.'] * int(ch)
            safe_print(queue, Fore.LIGHTRED_EX + f"    Adding empty block: {block}")
            blocks.append(block)

        empty = not empty

    disk = []
    for idx, block in enumerate(blocks):
        safe_print(queue, Fore.YELLOW + f"  [DEBUG] Flattening block {idx}: {block}")
        disk += block

    safe_print(queue, Fore.YELLOW + f"[DEBUG] Final formatted disk: {''.join(disk)}")
    return disk


def fill_spaces(disk, queue):
    safe_print(queue, Fore.GREEN + "[DEBUG] Starting defragmentation...")
    l, r = 0, len(disk) - 1

    while True:
        moved = False
        safe_print(queue, Fore.GREEN + f"  [DEBUG] Starting new defragmentation pass. Disk: {''.join(disk)}")

        while l < r:
            while l < r and disk[l] != '.':
                l += 1
            while l < r and disk[r] == '.':
                r -= 1
                moved = True

            if l < r:
                safe_print(queue, Fore.GREEN + f"    [DEBUG] Swapping elements at indices {l} (value: {disk[l]}) and {r} (value: {disk[r]})")
                disk = disk[:l] + [disk[r]] + disk[l+1:r] + [disk[l]] + disk[r+1:]
                l += 1
                r -= 1

        if not moved:
            safe_print(queue, Fore.GREEN + f"  [DEBUG] No more moves. Defragmentation finished.")
            break

    safe_print(queue, Fore.GREEN + f"[DEBUG] Defragmented disk: {''.join(disk)}")
    return disk


def calculate_checksum(disk, queue):
    safe_print(queue, Fore.CYAN + "[DEBUG] Calculating checksum...")
    checksum = 0
    for i in range(len(disk)):
        if disk[i].isdigit():
            safe_print(queue, Fore.CYAN + f"  [DEBUG] Adding {disk[i]} * {i} to checksum.")
            checksum += int(disk[i]) * i
    safe_print(queue, Fore.CYAN + f"[DEBUG] Checksum calculated: {checksum}")
    return checksum


def get_file_positions(disk, queue):
    safe_print(queue, Fore.MAGENTA + "[DEBUG] Identifying file positions...")
    files = []
    i = 0

    while i < len(disk):
        if disk[i].isdigit():
            start = i
            current_id = disk[i]
            while i < len(disk) and disk[i].isdigit() and disk[i] == current_id:
                i += 1
            files.append((start, i - 1))
            safe_print(queue, Fore.MAGENTA + f"  [DEBUG] Found file with ID {current_id} from {start} to {i - 1}")
        else:
            i += 1

    safe_print(queue, Fore.MAGENTA + f"[DEBUG] File positions: {files}")
    return files


def move_files(disk, files, queue):
    safe_print(queue, Fore.RED + "[DEBUG] Moving files...")

    def find_free_space(disk, start, length):
        i = 0
        while i < start:
            if disk[i] == '.':
                space_count = 0
                j = i
                while j < len(disk) and disk[j] == '.' and space_count < length:
                    space_count += 1
                    j += 1
                if space_count >= length:
                    safe_print(queue, Fore.RED + f"  [DEBUG] Found free space for length {length} starting at index {i}")
                    return i
            i += 1
        return -1

    sorted_files = sorted(files, key=lambda x: int(disk[x[0]]), reverse=True)

    for start, end in sorted_files:
        file_length = end - start + 1
        file_id = disk[start]

        safe_print(queue, Fore.RED + f"  [DEBUG] Attempting to move file ID {file_id} of length {file_length}")
        new_pos = find_free_space(disk, start, file_length)

        if new_pos != -1:
            safe_print(queue, Fore.RED + f"    [DEBUG] Moving file ID {file_id} to new position starting at index {new_pos}")
            file_content = [file_id] * file_length
            disk[start:end + 1] = ['.'] * file_length
            disk[new_pos:new_pos + file_length] = file_content
        else:
            safe_print(queue, Fore.RED + f"    [DEBUG] No free space found for file ID {file_id}")

    safe_print(queue, Fore.RED + f"[DEBUG] Disk after moving files: {''.join(disk)}")


def first_part(line, queue):
    safe_print(queue, Fore.BLUE + "[DEBUG] Running first part...")
    disk = get_formatted_disk(line, queue)
    defragmented_disk = fill_spaces(disk, queue)
    return calculate_checksum(defragmented_disk, queue)


def second_part(line, queue):
    safe_print(queue, Fore.LIGHTBLUE_EX + "[DEBUG] Running second part...")
    disk = get_formatted_disk(line, queue)
    files = get_file_positions(disk, queue)
    move_files(disk, files, queue)
    return calculate_checksum(disk, queue)


if __name__ == "__main__":
    manager = Manager()
    print_queue = manager.Queue()  # Shared queue for printing
    line = read_input()

    with ProcessPoolExecutor() as executor:
        # Submit tasks to be executed in parallel
        future_first = executor.submit(first_part, line, print_queue)
        future_second = executor.submit(second_part, line, print_queue)

        # Collect results while processing print messages
        first_result = None
        second_result = None

        while not (future_first.done()): # future_second.done()
            while not print_queue.empty():
                print(print_queue.get())  # Print messages from the queue

        # Fetch final results
        first_result = future_first.result()
        second_result = future_second.result()

        # Ensure all queued messages are printed
        while not print_queue.empty():
            print(print_queue.get())

    # Print results
    print(Style.BRIGHT + Fore.YELLOW + "First part result: " + str(first_result))
    print(Style.BRIGHT + Fore.CYAN + "Second part result: " + str(second_result))
    print()
