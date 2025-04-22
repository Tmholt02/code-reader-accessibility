# Simple Python script with basic features

# Greeting message
print("Hello! Let's try some basic Python features.")

# Get user input
name = input("Please enter your name: ")

# If-else statement
if name:
    print(f"Welcome, {name}!")
else:
    print("Welcome, guest!")

# For loop with numbers
print("\nCounting from 1 to 5:")
for number in range(1, 6):
    print(number)

# List and for loop
fruits = ["apple", "banana", "cherry"]
print("\nMy favorite fruits:")
for fruit in fruits:
    print(fruit.capitalize())

# If-elif-else structure
age = int(input("\nPlease enter your age: "))
if age < 13:
    print("You're a child!")
elif age < 20:
    print("You're a teenager!")
else:
    print("You're an adult!")

# Final message
print("\nThanks for trying this basic program! Goodbye!")