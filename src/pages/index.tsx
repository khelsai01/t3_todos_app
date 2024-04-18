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
  dueDate: Date | null;
  dueTime: Date | null;
  category: "WORK" | "PERSONAL" | "FITNESS" | null;
}

export default function Home() {
  const { data: session } = useSession();
  const currentDate = new Date();
  const hours = currentDate.getHours().toString().padStart(2, '0');
  const minutes = currentDate.getMinutes().toString().padStart(2, '0');
  const currentTime =`${hours}:${minutes}`;

  const [todoData, setTodoData] = useState({
    title: "",
    details: "",
    dueDate: new Date().toISOString().split("T")[0],
    dueTime: currentTime,
  });

  const [editId, setEditId] = useState<string>("");
  const [load, setLoad] = useState<boolean>(false);
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("LOW");
  const [category, setCategory] = useState<"WORK" | "PERSONAL" | "FITNESS">("WORK");
  const [sortedTodos, setSortedTodos] = useState<Todo[]>([]);
  const [sortBy, setSortBy] = useState<"dueDate" | "priority" | "completion" | "category">(
    "dueDate",
  );
  const [dueDateFilter, setDueDateFilter] = useState<Date | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<
    "LOW" | "MEDIUM" | "HIGH" | null
  >(null);
  const [categoryFilter, setCategoryFilter] = useState<
    "WORK" | "PERSONAL" | "FITNESS" | null
  >(null);
  const [completionFilter, setCompletionFilter] = useState<boolean | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [isSearchEmpty, setIsSearchEmpty] = useState(true);



  const [errorObj, setErrorObj] = useState<{
    title?: string;
    details?: string;
  }>({});

  const ctx = api.useUtils();
  const { data, isLoading: todosLoading } = api.todo.getTodosByUser.useQuery(
    session?.user?.id ?? "",
  );
  const [searchResults, setSearchResults] = useState<Todo[]>(data ?? []);
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
    }
    else if (sortBy === "category") {
      const sortedByCategory = [...(data ?? [])].sort((a, b) => {
        const categoryOrder = { WORK: 0, PERSONAL: 1, FITNESS: 2 };

        if (a.category === null && b.category === null) return 0;
        if (a.category === null) return 1;
        if (b.category === null) return -1;

        return categoryOrder[a.category] - categoryOrder[b.category];
      });

      setSortedTodos(sortedByCategory);
    }


    else if (sortBy === "completion") {
      const sortedByCompletion = [...(data ?? [])].sort((a, b) => {
        return a.done === b.done ? 0 : a.done ? 1 : -1;
      });
      setSortedTodos(sortedByCompletion);
    }
  }, [data, sortBy]);

  const handleSortBy = (criteria: "dueDate" | "priority" | "category" | "completion") => {
    setSortBy(criteria);
  };

  useEffect(() => {
    let filteredTodos = [...(data ?? [])];

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

    if (priorityFilter) {
      filteredTodos = filteredTodos.filter(
        (todo) => todo.priority === priorityFilter,
      );
    }

    if (categoryFilter) {
      filteredTodos = filteredTodos.filter(
        (todo) => todo.category === categoryFilter,
      );
    }


    if (completionFilter !== null) {
      filteredTodos = filteredTodos.filter(
        (todo) => todo.done === completionFilter,
      );
    }
    if (sortBy === "dueDate") {
      filteredTodos.sort((a, b) => {
        const dateA = a.dueDate ? new Date(a.dueDate) : new Date();
        const dateB = b.dueDate ? new Date(b.dueDate) : new Date();
        return dateA.getTime() - dateB.getTime();
      });
    } else if (sortBy === "priority") {
      const priorityOrder = { LOW: 1, MEDIUM: 2, HIGH: 3 };
      filteredTodos.sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
      );
    }
    else if (sortBy === "category") {
      const sortedByCategory = [...(data ?? [])].sort((a, b) => {
        const categoryOrder = { WORK: 0, PERSONAL: 1, FITNESS: 2 };

        if (a.category === null && b.category === null) return 0;
        if (a.category === null) return 1;
        if (b.category === null) return -1;

        return categoryOrder[a.category] - categoryOrder[b.category];
      });

      setSortedTodos(sortedByCategory);
    }
    else if (sortBy === "completion") {
      filteredTodos.sort((a, b) => (a.done === b.done ? 0 : a.done ? 1 : -1));
    }

    setSortedTodos(filteredTodos);
  }, [data, sortBy, dueDateFilter, priorityFilter, categoryFilter, completionFilter]);

  useEffect(() => {
    if (!todosLoading && data) {
      data.forEach((todo: Todo) => {
        const isDueSoon = checkDueDate(todo.dueDate);

        if (!todo.done && isDueSoon) {
          toast(`Task ,${todo.title} due soon!, { icon: "ℹ" }`);
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
        dueTime: currentTime,
      });
      setCategory("WORK");
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

  const checkDueDate = (dueDate: Date | null): boolean => {
    if (!dueDate) return false;

    const now = new Date();
    const differenceInDays = Math.floor(
      (dueDate.getTime() - now.getTime()) / (1000 * 3600 * 24),
    );

    return differenceInDays <= 3;
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
        dueTime: currentTime,
      });
      setEditId("");
      setCategory("WORK");
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

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTodoData(prevData => ({ ...prevData, dueTime: value }));
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
      category: category,
    });
  };

  const handleEdit = (todo: Todo) => {
    setTodoData((prevData) => ({
      ...prevData,
      title: todo.title ?? "",
      details: todo.details ?? "",
      dueDate: todo.dueDate
        ? new Date(todo.dueDate).toISOString().split("T")[0]
        : "",
      dueTime: todo.dueTime
        ? prevData.dueTime
        : "",
      category: todo.category ?? "WORK",
    }));
    setCategory(todo.category ?? "WORK");
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
      category: category,
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

      if (!searchQuery) {
        setIsSearchEmpty(true);
        return !dueDateFilter || isDueDateMatch;
      }

      setIsSearchEmpty(false);

      return isKeywordMatch && (!dueDateFilter || isDueDateMatch);
    });

    setSearchResults(filteredTodos);
  };
  const handleClearFilter = () => {
    setCategoryFilter(null);
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
            <input
              type="text"
              placeholder="Search by keyword or due date"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              className={`my-4 rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none ${errorObj.details ? "border-red-500" : ""
                }`}
            />
            <button
              onClick={() => {
                handleSearch();
              }}
              className="my-3 rounded-md bg-blue-400 px-4 py-2 text-white shadow hover:bg-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
            >
              Search
            </button>

            <input
              type="text"
              name="title"
              placeholder="Title"
              value={todoData.title}
              onChange={handleChange}
              className={`my-4 rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none ${errorObj.details ? "border-red-500" : ""
                }`}
            />
            {errorObj.title && (
              <p className="my-1 text-red-500">{errorObj.title}</p>
            )}
            <textarea
              placeholder="Details of todo..."
              name="details"
              value={todoData.details}
              onChange={handleChange}
              className={`my-4 rounded-md border border-gray-300 p-2 focus:outline-none ${errorObj.details ? "border-red-500" : ""
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
              <select
                name="category"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as "WORK" | "PERSONAL" | "FITNESS")
                }
              >
                <option value="WORK">WORK</option>
                <option value="PERSONAL">PERSONAL</option>
                <option value="FITNESS">FITNESS</option>
              </select>
              <input
                type="date"
                name="dueDate"
                value={todoData.dueDate ?? ""}
                onChange={handleDateChange}
              />

              <input
                type="time"
                name="dueTime"
                value={todoData.dueTime ?? ""}
                onChange={handleTimeChange}
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
              <button onClick={() => handleSortBy("category")}>Category</button>
              <button onClick={() => handleSortBy("completion")}>
                Completion
              </button>
            </div>
          </div>

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
              value={categoryFilter ?? ""}
              onChange={(e) =>
                setCategoryFilter(
                  e.target.value as "WORK" | "PERSONAL" | "FITNESS" | null,
                )
              }
            >
              <option value="">All Categories</option>
              <option value="WORK">WORK</option>
              <option value="PERSONAL">PERSONAL</option>
              <option value="FITNESS">FITNESS</option>
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

          {load ? (
            <LoadingSpine />
          ) : (
            <div className="my-4 w-1/2 gap-3">
              {searchQuery !== ""
                ? searchResults.map((todo: Todo) => (
                  <div
                    key={todo.id}
                    className={`mb-2 mt-4 flex items-center gap-2 rounded-md bg-gradient-to-r from-gray-200 via-green-200 to-blue-300 p-3 ${todo.done ? "line-through" : ""
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
                      className={`flex w-3/4 flex-col justify-start ${todo.done ? "line-through" : ""
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
                    className={`mb-2 mt-4 flex items-center gap-2 rounded-md bg-gradient-to-r from-gray-200 via-green-200 to-blue-300 p-3 ${todo.done ? "line-through" : ""
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
                      className={`flex w-3/4 flex-col justify-start ${todo.done ? "line-through" : ""
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