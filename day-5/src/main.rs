mod utils;
use utils::{read_input, parse_rules, parse_updates, calculate_sums};
use std::io;
use colored::*;

fn main() -> io::Result<()> {
    // Načti vstupní data ze souboru
    let contents = read_input("./resources/real")?;
    println!("{}", "File Contents:".blue().bold());
    println!("{}", contents);

    // Rozděl vstup na sekce
    let (rules_section, updates_section) = utils::split_sections(&contents)?;

    println!("{}", "Rules Section:".green().bold());
    println!("{}", rules_section);

    println!("{}", "Updates Section:".green().bold());
    println!("{}", updates_section);

    // Zpracuj pravidla a aktualizace
    let ordering_rules = parse_rules(rules_section)?;
    let updates = parse_updates(updates_section)?;

    // Spočítej součty
    let (total_middle_sum, total_middle_sum_fixed) = calculate_sums(&ordering_rules, &updates);

    println!(
        "{} {}",
        "Total middle sum of correct updates:".green().bold(),
        total_middle_sum.to_string().cyan()
    );
    println!(
        "{} {}",
        "Total middle sum of fixed updates:".red().bold(),
        total_middle_sum_fixed.to_string().cyan()
    );

    Ok(())
}
