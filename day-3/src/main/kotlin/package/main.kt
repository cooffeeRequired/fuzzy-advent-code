import kotlinx.benchmark.Benchmark

fun main() {
    val test = readInput("test")!!
    val test2 = readInput("test2")!!
    val input = readInput("real")!!

    println("Total test sum: ${calc(test)}")
    println("Total real sum: ${calc(input)}")

    println("Total test sum with instructions: ${callWithInstruction(test2)}")
    println("Total real sum with instructions: ${callWithInstruction(input)}")
}

@Benchmark
fun readInput(path: String): String? = object {}.javaClass.getResource(path)?.readText()

@Benchmark
fun calc(input: String): Int {
    val splitRegex = Regex("""mul\(\d{0,3},\d{0,3}\)""")

    val maxVal: Int = splitRegex.findAll(input).sumOf {
        val group = it.value
        val filtered = group.removePrefix("mul(").removeSuffix(")")
        val numbers = filtered.split(",").map { str -> str.toInt() }
        numbers[0] * numbers[1]
    }

    return maxVal
}

@Benchmark
fun callWithInstruction (input: String): Int {
    val regex = Regex("""(do|don't)\(\)|mul\((\d{1,3}),(\d{1,3})\)""")
    var enabled = true
    var sum = 0


    regex.findAll(input).forEach { match ->
        val instruction = match.value

        when {
            instruction.startsWith("do()") -> enabled = true
            instruction.startsWith("don't()") -> enabled = false
            instruction.startsWith("mul") && enabled -> {
                val (_, g2, g3) = match.destructured
                sum += g2.toInt() * g3.toInt()
            }
        }

    }

    return sum
}