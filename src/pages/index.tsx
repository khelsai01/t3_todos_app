import { useSession } from "next-auth/react";
import { api } from "@/utils/api";
import { useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { Header } from "@/components/header";
import Landing from "@/components/Home";
import { LoadingSpine } from "@/components/Loading";
import { toast } from "react-hot-toast";

interface Todo {
  id: string;
  title: string;
  details: string;
  done: boolean;
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate: Date | null;
}

export default function Home() {
  const { data: session } = useSession();
  const [todoData, setTodoData] = useState({
    title: "",
    details: "",
    dueDate: new Date().toISOString().split("T")[0],
  });
  console.log(todoData.dueDate);

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

  // const { data: categories } = api.category.getCategories.useQuery();
  // console.log(categories)

  const { mutate } = api.todo.createTodo.useMutation({
    onSuccess: () => {
      setTodoData({
        title: "",
        details: "",
        dueDate: new Date().toISOString().split("T")[0],
      });
      setPriority("LOW");
      setErrorObj({});
      setLoad(false);
      toast.success("Todo added successfully", { icon: "🚀" });
      void ctx.todo.getTodosByUser.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to add todo");
      console.error(error);
    },
  });
  const { mutate: setDoneMutate } = api.todo.setDone.useMutation({
    onSuccess: () => {
      setLoad(false);
      toast.success("Todo status updated successfully", { icon: "🚀" });

      void ctx.todo.getTodosByUser.invalidate();
    },
    onError: (error) => {
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
    onError: (error) => {
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
      });
      setEditId("");
      setPriority("LOW");
      setLoad(false);
      toast.success("Todo updated successfully", { icon: "🚀" });
      void ctx.todo.getTodosByUser.invalidate();
    },
    onError: (error) => {
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
    const { value } = e.target;
    setTodoData((prevData) => ({ ...prevData, dueDate: value }));
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
    console.log(errors);
    return Object.keys(errors).length === 0;
  };

  console.log(data);

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
    });
  };

  const handleEdit = (todo: Todo) => {
    setTodoData({
      title: todo.title ?? "",
      details: todo.details ?? "",
      dueDate: todo.dueDate?.toISOString().split("T")[0] ?? "",
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
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={todoData.title}
              onChange={handleChange}
              className={`my-4 rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none ${errorObj.details ? `border-red-500` : ""}`}
            />
            {errorObj.title && (
              <p className="my-1 text-red-500">{errorObj.title}</p>
            )}
            <textarea
              placeholder="Details of todo..."
              name="details"
              value={todoData.details}
              onChange={handleChange}
              className={`my-4 rounded-md border border-gray-300 p-2 focus:outline-none ${errorObj.details ? `border-red-500` : ""}`}
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
              <input
                type="date"
                name="dueDate"
                value={todoData.dueDate}
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
          {load ? (
            <LoadingSpine />
          ) : (
            <div className="my-4 w-1/2 gap-3">
              {data?.map((todo, index) => (
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
                    className={`flex w-3/4 flex-col justify-start  ${todo.done ? "line-through" : ""}`}
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
