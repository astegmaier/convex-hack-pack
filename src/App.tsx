import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

function App() {
  const [newIdea, setNewIdea] = useState("");
  const [newCategories, setNewCategories] = useState("");
  const [includeRandom, setIncludeRandom] = useState(true);

  const ideas = useQuery(api.myFunctions.listIdeas, { includeRandom });
  const saveIdea = useMutation(api.myFunctions.saveIdea).withOptimisticUpdate(
    (localStore, args) => {
      const { idea, categories } = args;
      const currentIdeas = localStore.getQuery(api.myFunctions.listIdeas, { includeRandom }) ?? [];
      localStore.setQuery(api.myFunctions.listIdeas, { includeRandom }, [
        ...currentIdeas,
        {
          _id: crypto.randomUUID(),
          _creationTime: Date.now(),
          idea,
          categories,
          random: false
        },
      ]);
      setNewIdea("");
      setNewCategories("");
    }
  );
  const generateIdea = useAction(api.myFunctions.fetchRandomIdea);

  return (
    <>
      <main className="container max-w-2xl flex flex-col gap-8">
        <h1 className="text-3xl font-extrabold mt-8 text-center">
          Get hacking with Convex
        </h1>

        <h2 className="text-center">Let's brainstorm apps to build!</h2>

        <form className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Input
              type="text"
              value={newIdea}
              onChange={(event) => setNewIdea(event.target.value)}
              placeholder="Type your app idea here"
            />
            <Button
              type="submit"
              disabled={!newIdea}
              title={
                newIdea
                  ? "Save your idea to the database"
                  : "You must enter an idea first"
              }
              onClick={async (e) => {
                e.preventDefault();
                await saveIdea({ 
                  idea: newIdea.trim(), 
                  random: false,
                  categories: newCategories.trim() || undefined
                });
                setNewIdea("");
                setNewCategories("");
              }}
              className="min-w-fit"
            >
              Save idea
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              type="text"
              value={newCategories}
              onChange={(event) => setNewCategories(event.target.value)}
              placeholder="Categories (comma separated)"
            />
          </div>
        </form>

        <div className="flex justify-between items-center">
          <Button
            onClick={async () => {
              await generateIdea();
            }}
            title="Save a randomly generated app idea to the database"
          >
            Generate a random app idea
          </Button>

          <div
            className="flex gap-2"
          >
            <Checkbox
              id="show-random"
              checked={includeRandom}
              onCheckedChange={() => setIncludeRandom(!includeRandom)}
            />
            <Label htmlFor="show-random">
              Include random ideas
            </Label>
          </div>
        </div>

        <ul className="space-y-2">
          {ideas?.map((document, i) => (
            <li key={i} className="p-2 border border-border rounded-md">
              <div>
                <span className="font-bold">{document.random ? "🤖 " : "💡 "}{document.idea}</span>
              </div>
              {document.categories && (
                <div className="mt-1 text-sm text-muted-foreground">
                  Categories: {document.categories}
                </div>
              )}
            </li>
          ))}
        </ul>
      </main>
      <footer className="text-center text-xs mb-5 mt-10 w-full">
        <p>
          Built with <a href="https://convex.dev">Convex</a>,{" "}
          <a href="https://www.typescriptlang.org">TypeScript</a>,{" "}
          <a href="https://react.dev">React</a>, and{" "}
          <a href="https://vitejs.dev">Vite</a>
        </p>
        <p>
          Random app ideas thanks to{" "}
          <a target="_blank" href="https://appideagenerator.com/">
            appideagenerator.com
          </a>
        </p>
      </footer>
    </>
  );
}

export default App;
