/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useSession } from "next-auth/react";
import { api } from "@/utils/api";
import { useState, useEffect, type Key } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { Header } from "@/components/header";
import Landing from "@/components/Home";
import { LoadingSpine } from "@/components/Loading";
import { toast } from "react-hot-toast";
import { format } from 'date-fns-tz';


interface Todo {
  id: string;
  title: string;
  details: string;
  done: boolean;
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate: Date | null;  // Add dueDate field
  dueTime: Date | null;  // Add dueTime field
}

export default function Home() {
  const { data: session } = useSession();
  const [todoData, setTodoData] = useState({
    title: "",
    details: "",
    dueDate: new Date().toISOString().split("T")[0],
    dueTime: new Date().toISOString().split("T")[1]?.slice(0, 5), // Add null check for accessing array element
  });

  const [editId, setEditId] = useState<string>("");
  const [load, setLoad] = useState<boolean>(false);
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("LOW");

  const [errorObj, setErrorObj] = useState<{
    title?: string;
    details?: string;
  }>({});

  const ctx = api.useUtils();
  const { data, isLoading: todosLoading } = api.todo.getTodosByUser.useQuery(
    session?.user?.id ?? "",
  );

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
      (dueDate.getTime() - now.getTime()) / (1000 * 3600 * 24)
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
      dueTime: new Date(`${todoData.dueDate}T${todoData.dueTime}:00`).toISOString(),
    });
  };

  const handleEdit = (todo: Todo) => {
    
    setTodoData({
      title: todo.title ?? "",
      details: todo.details ?? "",
      dueDate: todo.dueDate ? new Date(todo.dueDate).toISOString().split("T")[0] : "",
      dueTime: todo.dueTime ? new Date(todo.dueTime).toISOString().split("T")[1]?.slice(0, 5) : "",
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
      dueTime: new Date(`${todoData.dueDate}T${todoData.dueTime}:00`).toISOString(),
    });
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
            {/* Title input */}
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={todoData.title}
              onChange={handleChange}
              className={`my-4 rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none ${errorObj.details ? `border-red-500` : ""
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
              className={`my-4 rounded-md border border-gray-300 p-2 focus:outline-none ${errorObj.details ? `border-red-500` : ""
                }`}
              onKeyDown={(e) => {
                if (e.key === "Enter" && editId == "") {
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

              <input
                type="time"
                name="dueTime"
                value={todoData.dueTime ?? ""}
                onChange={(e) =>
                  setTodoData((prevData) => ({
                    ...prevData,
                    dueTime: e.target.value,
                  }))
                }
              />

            </div>
            {/* Add/Edit Todo button */}
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
          {load ? (
            <LoadingSpine />
          ) : (
            <div className="my-4 w-1/2 gap-3">
              {data?.map((todo: Todo, index: Key | null | undefined) => (
                <div
                  className="mb-2 mt-4 flex items-center gap-2 rounded-md bg-gradient-to-r from-gray-200 via-green-200 to-blue-300 p-3"
                  key={index}
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
                    className={`flex w-3/4 flex-col justify-start  ${todo.done ? "line-through" : ""
                      }`}
                  >
                    <p className={`text-lg font-semibold`}>{todo.title}</p>
                    <p className={`} text-gray-500`}>{todo.details}</p>
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
                      className="m-auto w-[70%] cursor-pointer "
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