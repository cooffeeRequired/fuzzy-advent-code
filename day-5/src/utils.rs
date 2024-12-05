use std::fs::File;
use std::io::{self, Read};
use std::collections::{HashMap, HashSet, VecDeque};
use colored::*;

/// Načtení vstupních dat ze souboru
pub fn read_input(input: &str) -> io::Result<String> {
    let mut file: File = File::open(input)?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    Ok(contents)
}

/// Rozdělení vstupu na dvě sekce
pub fn split_sections(contents: &str) -> io::Result<(String, String)> {
    let contents = contents.replace("\r", ""); // Odstranění \r pro Windows
    let mut sections = contents.split("\n\n");

    let rules_section = sections.next().unwrap_or("").to_string();
    let updates_section = sections.next().unwrap_or("").to_string();

    if rules_section.is_empty() || updates_section.is_empty() {
        Err(io::Error::new(
            io::ErrorKind::InvalidInput,
            "Input file must contain two sections separated by an empty line.",
        ))
    } else {
        Ok((rules_section, updates_section))
    }
}

/// Zpracování pravidel z jejich sekce
pub fn parse_rules(rules_section: String) -> io::Result<HashMap<u32, Vec<u32>>> {
    let mut ordering_rules: HashMap<u32, Vec<u32>> = HashMap::new();
    for line in rules_section.lines() {
        let parts: Vec<&str> = line.split('|').collect();
        if parts.len() != 2 {
            return Err(io::Error::new(
                io::ErrorKind::InvalidInput,
                format!("Invalid rule format: {}", line),
            ));
        }

        let x: u32 = parts[0]
            .parse()
            .map_err(|_| io::Error::new(io::ErrorKind::InvalidInput, "Failed to parse page number X"))?;
        let y: u32 = parts[1]
            .parse()
            .map_err(|_| io::Error::new(io::ErrorKind::InvalidInput, "Failed to parse page number Y"))?;
        ordering_rules.entry(x).or_default().push(y);
    }
    Ok(ordering_rules)
}

/// Zpracování aktualizací z jejich sekce
pub fn parse_updates(updates_section: String) -> io::Result<Vec<Vec<u32>>> {
    updates_section
        .lines()
        .map(|line| {
            line.split(',')
                .map(|s| {
                    s.parse::<u32>().map_err(|_| {
                        io::Error::new(io::ErrorKind::InvalidInput, "Failed to parse page number")
                    })
                })
                .collect()
        })
        .collect()
}

/// Spočítá součty správných a opravených aktualizací
pub fn calculate_sums(
    ordering_rules: &HashMap<u32, Vec<u32>>,
    updates: &[Vec<u32>],
) -> (u32, u32) {
    let mut total_middle_sum = 0;
    let mut total_middle_sum_fixed = 0;

    for update in updates {
        if is_update_correct(ordering_rules, update) {
            let middle = middle_page(update);
            println!(
                "{} {:?} {} {}",
                "Correct update:".green().bold(),
                update,
                "Middle page:".blue(),
                middle.to_string().yellow()
            );
            total_middle_sum += middle;
        } else {
            let fixed_update = fix_update(ordering_rules, update);
            let middle = middle_page(&fixed_update);
            println!(
                "{} {:?} {} {:?} {} {}",
                "Incorrect update:".red().bold(),
                update,
                "Fixed to:".yellow(),
                fixed_update,
                "Middle page:".blue(),
                middle.to_string().yellow()
            );
            total_middle_sum_fixed += middle;
        }
    }

    (total_middle_sum, total_middle_sum_fixed)
}

/// Kontrola, zda je aktualizace správně seřazena
pub fn is_update_correct(ordering_rules: &HashMap<u32, Vec<u32>>, update: &[u32]) -> bool {
    let update_set: HashSet<_> = update.iter().copied().collect(); // Sada stránek v aktualizaci

    for (x, dependents) in ordering_rules {
        if !update_set.contains(x) {
            continue; // Ignoruj pravidla pro stránky, které nejsou v aktualizaci
        }

        for &y in dependents {
            if !update_set.contains(&y) {
                continue; // Ignoruj pravidla, kde stránka Y není v aktualizaci
            }

            let pos_x = update.iter().position(|&page| page == *x).unwrap();
            let pos_y = update.iter().position(|&page| page == y).unwrap();

            if pos_x > pos_y {
                println!(
                    "{} {:?} {} {} {} {}",
                    "Violation:".red().bold(),
                    update,
                    x.to_string().yellow(),
                    "must come before".blue(),
                    y.to_string().yellow(),
                    "but it doesn't.".red()
                );
                return false;
            }
        }
    }
    true
}

/// Oprava aktualizace podle pravidel pomocí topologického třídění
pub fn fix_update(ordering_rules: &HashMap<u32, Vec<u32>>, update: &[u32]) -> Vec<u32> {
    let mut graph: HashMap<u32, Vec<u32>> = HashMap::new();
    let mut in_degree: HashMap<u32, usize> = HashMap::new();

    // Vytvoření grafu a počítání in-degree
    for &page in update {
        graph.entry(page).or_default();
        in_degree.entry(page).or_default();
    }

    for (x, dependents) in ordering_rules {
        if !update.contains(x) {
            continue;
        }

        for &y in dependents {
            if !update.contains(&y) {
                continue;
            }

            graph.entry(*x).or_default().push(y);
            *in_degree.entry(y).or_default() += 1;
        }
    }

    // Topologické třídění pomocí BFS
    let mut queue: VecDeque<u32> = VecDeque::new();
    for (&page, &deg) in &in_degree {
        if deg == 0 {
            queue.push_back(page);
        }
    }

    let mut sorted = Vec::new();
    while let Some(page) = queue.pop_front() {
        sorted.push(page);

        if let Some(neighbors) = graph.get(&page) {
            for &neighbor in neighbors {
                let entry = in_degree.entry(neighbor).or_default();
                *entry -= 1;

                if *entry == 0 {
                    queue.push_back(neighbor);
                }
            }
        }
    }

    sorted
}

/// Výpočet prostřední stránky aktualizace
pub fn middle_page(update: &[u32]) -> u32 {
    let middle_index = update.len() / 2;
    update[middle_index]
}
