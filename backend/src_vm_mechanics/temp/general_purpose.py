class Ab:
    def __init__(self, aaa) -> None:
        self.asd = 1
        self.abb = aaa

ac = []
ab = Ab(1)
ac.append(ab)
ab = Ab(2)
ac.append(ab)

for i in ac:
    if i.abb == 2:
        print("deleting")
        ac.remove(i)


print("end")