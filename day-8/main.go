package main

import (
	"bufio"
	"fmt"
	"log"
	"os"
	"sync"
)

type Point struct {
	X int
	Y int
}

type Input struct {
	Map    map[string][]Point
	Width  int
	Height int
}

func readInput(filename string) Input {
	fmt.Println("\033[33mReading input from file:", filename, "\033[0m")

	file, err := os.Open(filename)
	if err != nil {
		log.Fatalf("\033[31mError reading input file: %v\033[0m", err)
	}
	defer func(file *os.File) {
		err := file.Close()
		if err != nil {
			log.Fatalf("\033[31mError closing file: %v\033[0m", err)
		}
	}(file)

	scanner := bufio.NewScanner(file)
	inputMap := make(map[string][]Point)
	var width, height int

	y := 0
	for scanner.Scan() {
		line := scanner.Text()
		for x, char := range line {
			width = x
			if char == '.' {
				continue
			}
			symbol := string(char)
			inputMap[symbol] = append(inputMap[symbol], Point{X: x, Y: y})
		}
		y++
	}
	height = y

	if err := scanner.Err(); err != nil {
		log.Fatalf("\033[31mError reading input: %v\033[0m", err)
	}

	fmt.Printf("\033[32mInput successfully read. Dimensions: Width=%d, Height=%d\033[0m\n", width+1, height)
	return Input{Map: inputMap, Width: width + 1, Height: height}
}

func getListOfPair(symbol string, points []Point) []struct {
	Org Point
	Dst Point
	DX  int
	DY  int
} {
	fmt.Printf("\033[33mGenerating pairs for symbol: %s\033[0m\n", symbol)
	var pairs []struct {
		Org Point
		Dst Point
		DX  int
		DY  int
	}

	for i := 0; i < len(points)-1; i++ {
		for j := i + 1; j < len(points); j++ {
			org := points[i]
			dst := points[j]
			pairs = append(pairs, struct {
				Org Point
				Dst Point
				DX  int
				DY  int
			}{Org: org, Dst: dst, DX: dst.X - org.X, DY: dst.Y - org.Y})
		}
	}

	fmt.Printf("\033[32mGenerated %d pairs for symbol: %s\033[0m\n", len(pairs), symbol)
	return pairs
}

func part1(input Input, resultChan chan<- int, wg *sync.WaitGroup) {
	defer wg.Done()
	fmt.Println("\033[33mStarting Part 1\033[0m")
	antinodes := make(map[string]bool)

	for symbol, points := range input.Map {
		pairs := getListOfPair(symbol, points)
		for _, pair := range pairs {
			an1 := Point{X: pair.Org.X - pair.DX, Y: pair.Org.Y - pair.DY}
			an2 := Point{X: pair.Dst.X + pair.DX, Y: pair.Dst.Y + pair.DY}

			if an1.X >= 0 && an1.X < input.Width && an1.Y >= 0 && an1.Y < input.Height {
				antinodes[fmt.Sprintf("%d:%d", an1.X, an1.Y)] = true
			}
			if an2.X >= 0 && an2.X < input.Width && an2.Y >= 0 && an2.Y < input.Height {
				antinodes[fmt.Sprintf("%d:%d", an2.X, an2.Y)] = true
			}
		}
	}

	fmt.Printf("\033[32mPart 1 completed. Unique antinodes count: %d\033[0m\n", len(antinodes))
	resultChan <- len(antinodes)
}

func part2(input Input, resultChan chan<- int, wg *sync.WaitGroup) {
	defer wg.Done()
	fmt.Println("\033[33mStarting Part 2\033[0m")
	antinodes := make(map[string]bool)

	for symbol, points := range input.Map {
		pairs := getListOfPair(symbol, points)
		for _, pair := range pairs {
			addedFromOrg := addAntinode(pair.Org.X, pair.Org.Y, pair.DX, pair.DY, input.Width, input.Height)
			fmt.Printf("\033[34mAdded %d antinodes from origin (%d, %d)\033[0m\n", len(addedFromOrg), pair.Org.X, pair.Org.Y)
			for _, pos := range addedFromOrg {
				antinodes[pos] = true
			}

			addedFromDst := addAntinode(pair.Dst.X, pair.Dst.Y, -pair.DX, -pair.DY, input.Width, input.Height)
			fmt.Printf("\033[34mAdded %d antinodes from destination (%d, %d)\033[0m\n", len(addedFromDst), pair.Dst.X, pair.Dst.Y)
			for _, pos := range addedFromDst {
				antinodes[pos] = true
			}
		}
	}

	fmt.Printf("\033[32mPart 2 completed. Unique antinodes count: %d\033[0m\n", len(antinodes))
	resultChan <- len(antinodes)
}

func addAntinode(orgX, orgY, dx, dy, width, height int) []string {
	var positions []string
	x, y := orgX, orgY
	for x >= 0 && x < width && y >= 0 && y < height {
		positions = append(positions, fmt.Sprintf("%d:%d", x, y))
		x -= dx
		y -= dy
	}
	return positions
}

func main() {
	input := readInput("resources/real")

	part1ResultChan := make(chan int)
	part2ResultChan := make(chan int)

	var wg sync.WaitGroup
	wg.Add(2)

	go part1(input, part1ResultChan, &wg)
	go part2(input, part2ResultChan, &wg)

	go func() {
		wg.Wait()
		close(part1ResultChan)
		close(part2ResultChan)
	}()

	part1Result := <-part1ResultChan
	fmt.Printf("\033[32mPart 1 result: %d\033[0m\n", part1Result)

	part2Result := <-part2ResultChan
	fmt.Printf("\033[32mPart 2 result: %d\033[0m\n", part2Result)
}
