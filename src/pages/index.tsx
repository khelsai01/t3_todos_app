/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useSession } from "next-auth/react";
import { api } from "@/utils/api";
import { useState, useEffect } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { Header } from "@/components/header";
import Landing from "@/components/Home";
import { LoadingSpine } from "@/components/Loading";
import { toast } from "react-hot-toast";
import {AddMemberForm} from "./orgnization";

interface Todo {
  id: string;
  title: string;
  details: string;
  done: boolean;
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate: Date | null; // Add dueDate field
  dueTime: Date | null; // Add dueTime field
}

export default function Home() {
  const { data: session } = useSession();
  const [todoData, setTodoData] = useState({
    title: "",
    details: "",
    dueDate: new Date().toISOString().split("T")[0],
    dueTime: new Date().toISOString().split("T")[1]?.slice(0, 5), // Add null check for accessing array element
  });
  console.log(todoData.dueDate);

  const [editId, setEditId] = useState<string>("");
  const [load, setLoad] = useState<boolean>(false);
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("LOW");
  const [sortedTodos, setSortedTodos] = useState<Todo[]>([]);
  const [sortBy, setSortBy] = useState<"dueDate" | "priority" | "completion">(
    "dueDate",
  );
  const [dueDateFilter, setDueDateFilter] = useState<Date | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<
    "LOW" | "MEDIUM" | "HIGH" | null
  >(null);
  const [completionFilter, setCompletionFilter] = useState<boolean | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Todo[]>([]);
  const [isSearchEmpty, setIsSearchEmpty] = useState<boolean>(true);

  console.log(isSearchEmpty);

  const [errorObj, setErrorObj] = useState<{
    title?: string;
    details?: string;
  }>({});

  const ctx = api.useUtils();
  const { data, isLoading: todosLoading } = api.todo.getTodosByUser.useQuery(
    session?.user?.id ?? "",
  );

  useEffect(() => {
    if (sortBy === "dueDate") {
      const sortedByDueDate = [...(data ?? [])].sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
      setSortedTodos(sortedByDueDate);
    } else if (sortBy === "priority") {
      const sortedByPriority = [...(data ?? [])].sort((a, b) => {
        const priorityOrder = { LOW: 0, MEDIUM: 1, HIGH: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
      setSortedTodos(sortedByPriority);
    } else if (sortBy === "completion") {
      const sortedByCompletion = [...(data ?? [])].sort((a, b) => {
        return a.done === b.done ? 0 : a.done ? 1 : -1;
      });
      setSortedTodos(sortedByCompletion);
    }
  }, [data, sortBy]);

  const handleSortBy = (criteria: "dueDate" | "priority" | "completion") => {
    setSortBy(criteria);
  };

  useEffect(() => {
    let filteredTodos = [...(data ?? [])];

    // Apply due date filter
    if (dueDateFilter) {
      filteredTodos = filteredTodos.filter((todo) => {
        const todoDueDate = todo.dueDate ? new Date(todo.dueDate) : null;
        const filterDate = new Date(dueDateFilter);
        return (
          todoDueDate &&
          todoDueDate.getFullYear() === filterDate.getFullYear() &&
          todoDueDate.getMonth() === filterDate.getMonth() &&
          todoDueDate.getDate() === filterDate.getDate()
        );
      });
    }

    // Apply priority filter
    if (priorityFilter) {
      filteredTodos = filteredTodos.filter(
        (todo) => todo.priority === priorityFilter,
      );
    }

    // Apply completion status filter
    if (completionFilter !== null) {
      filteredTodos = filteredTodos.filter(
        (todo) => todo.done === completionFilter,
      );
    }

    // Sort the filtered todos
    if (sortBy === "dueDate") {
      // Sort by due date
      filteredTodos.sort((a, b) => {
        const dateA = a.dueDate ? new Date(a.dueDate) : new Date(); // Handle null value
        const dateB = b.dueDate ? new Date(b.dueDate) : new Date(); // Handle null value
        return dateA.getTime() - dateB.getTime();
      });
    } else if (sortBy === "priority") {
      // Sort by priority
      const priorityOrder = { LOW: 1, MEDIUM: 2, HIGH: 3 };
      filteredTodos.sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
      );
    } else if (sortBy === "completion") {
      // Sort by completion status
      filteredTodos.sort((a, b) => (a.done === b.done ? 0 : a.done ? 1 : -1));
    }

    setSortedTodos(filteredTodos);
  }, [data, sortBy, dueDateFilter, priorityFilter, completionFilter]);

  useEffect(() => {
    if (!todosLoading && data) {
      data.forEach((todo: Todo) => {
        const isDueSoon = checkDueDate(todo.dueDate);

        // Check if the task is not yet done and is due soon
        if (!todo.done && isDueSoon) {
          // Notify user about due date being near for incomplete tasks
          toast(`Task "${todo.title}" due soon!`, { icon: "ℹ️" });
        }
      });
    }
  }, [todosLoading, data]);

  const { mutate } = api.todo.createTodo.useMutation({
    onSuccess: () => {
      setTodoData({
        title: "",
        details: "",
        dueDate: new Date().toISOString().split("T")[0],
        dueTime: new Date().toISOString().split("T")[1]?.slice(0, 5), // Reset dueTime after creating todo with null check
      });
      setPriority("LOW");
      setErrorObj({});
      setLoad(false);
      toast.success("Todo added successfully", { icon: "🚀" });
      void ctx.todo.getTodosByUser.invalidate();
    },
    onError: (error: any) => {
      toast.error("Failed to add todo");
      console.error(error);
    },
  });

  // Function to check if due date is near or overdue
  const checkDueDate = (dueDate: Date | null): boolean => {
    if (!dueDate) return false; // Return false if dueDate is not set

    const now = new Date();
    const differenceInDays = Math.floor(
      (dueDate.getTime() - now.getTime()) / (1000 * 3600 * 24),
    );

    return differenceInDays <= 3; // Return true if due date is within 3 days
  };

  const { mutate: setDoneMutate } = api.todo.setDone.useMutation({
    onSuccess: () => {
      setLoad(false);
      toast.success("Todo status updated successfully", { icon: "🚀" });

      void ctx.todo.getTodosByUser.invalidate();
    },
    onError: (error: any) => {
      toast.error("Failed to update todo status");
      console.error(error);
    },
  });

  const { mutate: deleteMutate } = api.todo.deleteTodo.useMutation({
    onSuccess: () => {
      setLoad(false);
      toast.success("Todo deleted successfully", { icon: "🚀" });
      void ctx.todo.getTodosByUser.invalidate();
    },
    onError: (error: any) => {
      toast.error("Failed to delete todo");
      console.error(error);
    },
  });

  const { mutate: editMutate } = api.todo.editTodo.useMutation({
    onSuccess: () => {
      setTodoData({
        title: "",
        details: "",
        dueDate: new Date().toISOString().split("T")[0],
        dueTime: new Date().toISOString().split("T")[1]?.slice(0, 5), // Reset dueTime after editing todo with null check
      });
      setEditId("");
      setPriority("LOW");
      setLoad(false);
      toast.success("Todo updated successfully", { icon: "🚀" });
      void ctx.todo.getTodosByUser.invalidate();
    },
    onError: (error: any) => {
      toast.error("Failed to update todo");
      console.error(error);
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setTodoData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTodoData((prevData) => ({ ...prevData, [name]: value }));
  };

  const validateForm = () => {
    const errors: { title?: string; details?: string } = {};
    if (!todoData.title.trim()) {
      errors.title = "Title is required";
    }
    if (!todoData.details.trim()) {
      errors.details = "Details is required";
    }
    setErrorObj(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddTodo = () => {
    if (!validateForm()) return;

    setLoad(true);

    mutate({
      userId: session?.user.id ?? "",
      title: todoData.title,
      details: todoData.details,
      done: false,
      priority: priority,
      dueDate: new Date(todoData.dueDate ?? ""),
      dueTime: new Date(
        `${todoData.dueDate}T${todoData.dueTime}:00`,
      ).toISOString(),
    });
  };

  const handleEdit = (todo: Todo) => {
    setTodoData({
      title: todo.title ?? "",
      details: todo.details ?? "",
      dueDate: todo.dueDate
        ? new Date(todo.dueDate).toISOString().split("T")[0]
        : "",
      dueTime: todo.dueTime
        ? new Date(todo.dueTime).toISOString().split("T")[1]?.slice(0, 5)
        : "",
    });
    setPriority(todo.priority);
    setEditId(todo.id);
  };

  const handleEditsubmit = () => {
    setLoad(true);
    editMutate({
      id: editId,
      title: todoData.title,
      details: todoData.details,
      priority: priority,
      dueDate: new Date(todoData.dueDate ?? ""),
      dueTime: new Date(
        `${todoData.dueDate}T${todoData.dueTime}:00`,
      ).toISOString(),
    });
  };

  const handleSearch = () => {
    const filteredTodos = (data ?? []).filter((todo: Todo) => {
      const isKeywordMatch = todo.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const isDueDateMatch =
        dueDateFilter &&
        todo.dueDate &&
        new Date(todo.dueDate).toDateString() ===
          new Date(dueDateFilter).toDateString();

      // Check if search query is empty
      if (!searchQuery) {
        setIsSearchEmpty(true);
        return !dueDateFilter || isDueDateMatch; // Return true if due date matches or no due date filter
      }

      setIsSearchEmpty(false);

      // Return true if both keyword and due date match
      return isKeywordMatch && (!dueDateFilter || isDueDateMatch);
    });

    setSearchResults(filteredTodos);
  };
  const handleClearFilter = () => {
    setDueDateFilter(null);
    setPriorityFilter(null);
    setCompletionFilter(null);
  };

  if (todosLoading) {
    return <LoadingSpine />;
  }
  return (
    <div className="w-9/10 bg-gray-50">
      <Header />
      {!session ? (
        <Landing />
      ) : (
        <div className="flex flex-col items-center justify-center">
          <div className="m-auto flex flex-col">
            {/* Search input */}
            <input
              type="text"
              placeholder="Search by keyword or due date"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              className={`my-4 rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none ${
                errorObj.details ? "border-red-500" : ""
              }`}
            />
            {/* Search button */}
            <button
              onClick={() => {
                handleSearch();
              }}
              className="my-3 rounded-md bg-blue-400 px-4 py-2 text-white shadow hover:bg-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
            >
              Search
            </button>

            {/* Title input */}
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={todoData.title}
              onChange={handleChange}
              className={`my-4 rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none ${
                errorObj.details ? "border-red-500" : ""
              }`}
            />
            {errorObj.title && (
              <p className="my-1 text-red-500">{errorObj.title}</p>
            )}
            {/* Details input */}
            <textarea
              placeholder="Details of todo..."
              name="details"
              value={todoData.details}
              onChange={handleChange}
              className={`my-4 rounded-md border border-gray-300 p-2 focus:outline-none ${
                errorObj.details ? "border-red-500" : ""
              }`}
              onKeyDown={(e) => {
                if (e.key === "Enter" && editId === "") {
                  e.preventDefault();
                  if (todoData.title !== "" && todoData.details !== "") {
                    handleAddTodo();
                  }
                } else if (e.key === "Enter" && editId !== "") {
                  e.preventDefault();
                  if (todoData.title !== "" && todoData.details !== "") {
                    handleEditsubmit();
                  }
                }
              }}
            />
            {errorObj.details && (
              <p className="my-1 text-red-500">{errorObj.details}</p>
            )}
            <div className="w-full border border-gray-300">
              {/* Priority select */}
              <select
                name="priority"
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as "LOW" | "MEDIUM" | "HIGH")
                }
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
              {/* Due Date input */}
              <input
                type="date"
                name="dueDate"
                value={todoData.dueDate ?? ""}
                onChange={handleDateChange}
              />
            </div>

            {editId ? (
              <button
                disabled={!!errorObj.title || !!errorObj.details}
                onClick={handleEditsubmit}
                className="my-3 rounded-md bg-blue-400 px-4 py-2 text-white shadow hover:bg-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
              >
                Save Edit
              </button>
            ) : (
              <button
                onClick={handleAddTodo}
                className="my-3 rounded-md bg-blue-400 px-4 py-2 text-white shadow hover:bg-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
              >
                Add Todo
              </button>
            )}
          </div>
          <div>
            <AddMemberForm />
          </div>
          <div className="flex items-center justify-between">
            <span>Sort By:</span>
            <div>
              <button onClick={() => handleSortBy("dueDate")}>Due Date</button>
              <button onClick={() => handleSortBy("priority")}>Priority</button>
              <button onClick={() => handleSortBy("completion")}>
                Completion
              </button>
            </div>
          </div>

          {/* Filter and render todos */}
          <div className="flex gap-3">
            <input
              type="date"
              value={
                dueDateFilter ? dueDateFilter.toISOString().split("T")[0] : ""
              }
              onChange={(e) => setDueDateFilter(e.target.valueAsDate)}
              placeholder="Due Date Filter"
            />
            <select
              value={priorityFilter ?? ""}
              onChange={(e) =>
                setPriorityFilter(
                  e.target.value as "LOW" | "MEDIUM" | "HIGH" | null,
                )
              }
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
            <select
              value={
                completionFilter === null ? "" : completionFilter.toString()
              }
              onChange={(e) => {
                const value = e.target.value;
                setCompletionFilter(
                  value === "true" ? true : value === "false" ? false : null,
                );
              }}
            >
              <option value="">All Completion Status</option>
              <option value="true">Completed</option>
              <option value="false">Incomplete</option>
            </select>
          </div>

          <div className="mt-4">
            <button onClick={() => handleClearFilter()}>Clear Filters</button>
          </div>

          {/* Render filtered and sorted todos */}
          {load ? (
            <LoadingSpine />
          ) : (
            <div className="my-4 w-1/2 gap-3">
              {searchQuery !== ""
                ? searchResults.map((todo: Todo) => (
                    <div
                      key={todo.id}
                      className={`mb-2 mt-4 flex items-center gap-2 rounded-md bg-gradient-to-r from-gray-200 via-green-200 to-blue-300 p-3 ${
                        todo.done ? "line-through" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        style={{ zoom: 1.1 }}
                        checked={!!todo.done}
                        className="form-checkbox h-6 w-6 text-teal-400
                      focus:ring-teal-400"
                        onChange={() => {
                          setDoneMutate({
                            id: todo.id,
                            done: todo.done ? false : true,
                          });
                          setLoad(true);
                        }}
                      />
                      <div
                        className={`flex w-3/4 flex-col justify-start ${
                          todo.done ? "line-through" : ""
                        }`}
                      >
                        <p className={`text-lg font-semibold`}>{todo.title}</p>
                        <p className={`text-gray-500`}>{todo.details}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <EditIcon
                          sx={{ color: "green" }}
                          onClick={() => handleEdit(todo)}
                          className="m-auto w-[70%] cursor-pointer"
                        />
                        <DeleteForeverIcon
                          sx={{ color: "red" }}
                          onClick={() => {
                            deleteMutate(todo.id);
                            setLoad(true);
                          }}
                          className="m-auto w-[70%] cursor-pointer"
                        />
                      </div>
                    </div>
                  ))
                : sortedTodos.map((todo: Todo, index: number) => (
                    <div
                      key={index}
                      className={`mb-2 mt-4 flex items-center gap-2 rounded-md bg-gradient-to-r from-gray-200 via-green-200 to-blue-300 p-3 ${
                        todo.done ? "line-through" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        style={{ zoom: 1.1 }}
                        checked={!!todo.done}
                        className="form-checkbox h-6 w-6 text-teal-400 focus:ring-teal-400"
                        onChange={() => {
                          setDoneMutate({
                            id: todo.id,
                            done: todo.done ? false : true,
                          });
                          setLoad(true);
                        }}
                      />
                      <div
                        className={`flex w-3/4 flex-col justify-start ${
                          todo.done ? "line-through" : ""
                        }`}
                      >
                        <p className={`text-lg font-semibold`}>{todo.title}</p>
                        <p className={`text-gray-500`}>{todo.details}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <EditIcon
                          sx={{ color: "green" }}
                          onClick={() => handleEdit(todo)}
                          className="m-auto w-[70%] cursor-pointer"
                        />
                        <DeleteForeverIcon
                          sx={{ color: "red" }}
                          onClick={() => {
                            deleteMutate(todo.id);
                            setLoad(true);
                          }}
                          className="m-auto w-[70%] cursor-pointer"
                        />
                      </div>
                    </div>
                  ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
