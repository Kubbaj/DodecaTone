from itertools import combinations, permutations

def intervals(notes):
    """Compute the intervals between successive notes."""
    sorted_notes = sorted(notes)
    return [(sorted_notes[(i + 1) % len(sorted_notes)] - sorted_notes[i]) % 12 for i in range(len(sorted_notes))]

def normalize(intervals):
    """Normalize intervals to the lexicographically smallest rotation."""
    cyclic_permutations = [intervals[i:] + intervals[:i] for i in range(len(intervals))]
    return min(cyclic_permutations)

def unique_structures():
    unique_intervals = set()
    all_notes = list(range(12))
    
    for r in range(1, 13):  # Consider subsets of size 1 to 12
        for combo in combinations(all_notes, r):
            if len(combo) > 1:  # Skip single note combinations
                interval_sequence = intervals(combo)
                normalized = normalize(interval_sequence)
                unique_intervals.add(tuple(normalized))
    
    return unique_intervals

unique_set_count = len(unique_structures())
print(f"Number of unique structures: {unique_set_count}")

# Printing the unique interval structures
for structure in sorted(unique_structures()):
    print(structure)
